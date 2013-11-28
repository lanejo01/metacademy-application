/*global define*/
define(["backbone", "d3", "jquery", "underscore", "base/views/graph-view", "base/utils/utils", "base/utils/errors"], function(Backbone, d3, $, _, GraphView, Utils, ErrorHandler){
  "use strict";


  return (function(){


    /**
     * Private methods and variables
     */
    var pvt = {};

    // FIXME refactor these names given the names in graph-view.js, also look for unused css
    pvt.consts = _.extend(GraphView.prototype.getConstsClone(), {
      // ----- class and id names ----- //
      viewId: "explore-graph-view", // id of view element (div by default) must change in CSS as well
      // WARNING some changes must be propagated to the css file
      graphClass: "graph", // WARNING currently determined by graph generation -- changing this property will not change the class TODO fix
      nodeClass: "node", // WARNING currently determined by graph generation -- changing this property will not change the class TODO fix
      edgeClass: "edge", // WARNING currently determined by graph generation -- changing this property will not change the class TODO fix
      exploreSvgId: "explore-svg",
      hoveredClass: "hovered",
      useExpandClass: "use-expand",
      nodeLearnedClass: "node-learned",
      nodeImplicitLearnedClass: "implicit-learned",
      dataHoveredProp: "data-hovered",
      elIconClass: "e-to-l-icon",
      elIconNodeIdSuffix: "-el-icon",
      starClass: "node-star",
      starredClass: "node-starred",
      starHoveredClass: "node-star-hovered",
      checkClass: "checkmark",
      checkHoveredClass: "checkmark-hovered",
      checkNodeIdSuffix: "-check-g",
      starNodeIdSuffix: "-star-g",
      summaryDivSuffix: "-summary-txt",
      summaryWrapDivSuffix: "-summary-wrap",
      summaryTextClass: "summary-text",
      summaryWrapClass: "summary-wrap",
      summaryLeftClass: "tleft",
      summaryRightClass: "tright",
      locElemId: "invis-loc-elem", // invisible location element
      locElemClass: "invis-loc",
      eToLConceptTxtClass: "exp-to-learn-txt",
      learnIconName: "glasses-icon.svg",
      dataConceptTagProp: "data-concept",
      hoverTextButtonsId: "hovertext-buttons",
      NO_SUMMARY_MSG: "-- Sorry, this concept is under construction and currently does not have a summary. --", // message to display in explore view when no summary is present
      renderEvt: "viewRendered",
      // ----- rendering options ----- //
      defaultScale: 0.54,
      defaultGraphDepth: 200, // default depth of graph
      defaultExpandDepth: 1, // default number of dependencies to show on expand
      defaultGraphOrient: "BT", // orientation of graph ("BT", "TB", "LR", or "RL")
      defaultNodeSepDist: 1.7, // separation of graph nodes
      defaultNodeWidth: 2.7, // diameter of graph nodes
      numCharLineDisplayNode: 14, // max number of characters to display per title line of graph nodes
      summaryWidth: 350, // px width of summary node (TODO can we move this to css and obtain the width after setting the class?)
      summaryArrowWidth: 32, // summary triangle width
      summaryArrowTop: 28, // top distance to triangle apex
      summaryAppearDelay: 250, // delay before summary appears (makes smoother navigation)
      summaryHideDelay: 100,
      summaryFadeInTime: 50, // summary fade in time (ms)
      SQRT2DIV2: Math.sqrt(2)/2,
      maxZoomScale: 5, // maximum zoom-in level for graph
      minZoomScale: 0.05, //maximum zoom-out level for graph
      elIconScale: 1,
      elIconHeight: 29,
      elIconWidth: 29,
      elIconXOffset: -54,
      elIconYOffset: -16,
      starPts: "350,75 379,161 469,161 397,215 423,301 350,250 277,301 303,215 231,161 321,161", // svg star path
      starXOffset: -3,
      starYOffset: -20,
      starGScale: 0.11, // relative size of "completed" star group
      checkCircleR: 16, // radius of circle around "completed" check
      checkXOffset: -2, // px offset of checkmark from longest text element
      checkPath: "M -12,4 L -5,10 L 13,-6", // svg path to create check mark
      checkGScale: 0.79, // relative size of "completed" check group
      nodeIconsConstYOffset: 28, // constant y offset for the node icons
      nodeIconsPerYOffset: 9 // y offset for each text element for the node icons
    });
    pvt.summaryDisplays = {};
    pvt.summaryTOKillList = {};
    pvt.summaryTOStartList = {};
    pvt.isRendered = false;

    pvt.$hoverTxtButtonEl = $("#" + pvt.consts.hoverTextButtonsId);


    /**
     * Get summary box placement (top left) given node placement
     */
    pvt.getSummaryBoxPlacement = function(nodeRect, placeLeft){
      var viewConsts = pvt.consts,
          leftMultSign = placeLeft ? -1: 1,
          shiftDiff = (1 + leftMultSign*viewConsts.SQRT2DIV2)*nodeRect.width/2 + leftMultSign*viewConsts.summaryArrowWidth;
      if (placeLeft){shiftDiff -= viewConsts.summaryWidth;}
      return {
        top:  (nodeRect.top + (1-viewConsts.SQRT2DIV2)*nodeRect.height/2 - viewConsts.summaryArrowTop) + "px",
        left:  (nodeRect.left + shiftDiff) + "px"
      };
    };

    /**
     * Helper function to attach the summary div and add an event listener for leaving the summary
     */
    pvt.attachNodeSummary = function(d3node){
      // display the node summary
      var $wrapDiv = this.showNodeSummary(d3node);
      var hoveredClass = pvt.consts.hoveredClass;

      $wrapDiv.on("mouseenter", function(){
        $(this).addClass(hoveredClass);
      });
      // add listener to node summary so mouseouts trigger mouseout on node
      $wrapDiv.on("mouseleave", function(evt) {
        $(this).removeClass(hoveredClass);
        Utils.simulate(d3node.node(), "mouseout", {
          relatedTarget: evt.relatedTarget
        });
      });
    };

    /**
     * Adds the explore-to-learn node icons
     */
    pvt.addEToLIcon = function(d3node, svgSpatialInfo){
      var thisView = this,
          viewConsts = pvt.consts;
      svgSpatialInfo = svgSpatialInfo || Utils.getSpatialNodeInfo(d3node.node());

      var iconG = d3node.append("svg:image")
            .attr("xlink:href", window.STATIC_PATH + "images/list-icon.png") // TODO move hardcoding
            .attr("class", viewConsts.elIconClass)
            .attr("id", pvt.getELIconIdForNode.call(thisView, d3node))
            .attr("height", viewConsts.elIconHeight + "px")
            .attr("width", viewConsts.elIconWidth + "px")
            .attr(viewConsts.dataConceptTagProp, d3node.attr("id"));

      var numEls = d3node.selectAll("text")[0].length,
          elIconX = svgSpatialInfo.cx + viewConsts.elIconXOffset,
          elIconY = svgSpatialInfo.cy + viewConsts.nodeIconsConstYOffset
            + (numEls-1)*viewConsts.nodeIconsPerYOffset + viewConsts.elIconYOffset;
      iconG.attr("transform",
                 "translate(" + elIconX + "," + elIconY + ") "
                 + "scale(" + viewConsts.elIconScale + ")");

    };

    /**
     * Add bookmark star and associated properties to the given node
     * TODO refactor with addCheckMark
     */
    pvt.addStar = function(d3node, svgSpatialInfo){
      var thisView = this,
          viewConsts = pvt.consts,
          nodeId = d3node.attr("id"),
          mnode = thisView.model.get("nodes").get(nodeId),
          starHoveredClass = viewConsts.starHoveredClass,
          aux = window.agfkGlobals.auxModel;
      svgSpatialInfo = svgSpatialInfo || Utils.getSpatialNodeInfo(d3node.node());

      var starG = d3node.append("g")
            .attr("class", viewConsts.starClass)
            .attr("id", pvt.getStarIdForNode.call(thisView, d3node))
            .on("click", function(){
              // stop event from firing on the ellipse
              d3.event.stopPropagation();
              // change the starred status of the node model
              aux.toggleStarredStatus(nodeId);
            })
            .on("mouseover", function() {
              d3.select(this).classed(starHoveredClass, true);
            })
            .on("mouseout", function() {
              d3.select(this).classed(starHoveredClass, false);
            });
      starG.append("polygon")
        .attr("points", viewConsts.starPts);

      var numEls = d3node.selectAll("text")[0].length,
          starX = svgSpatialInfo.cx + viewConsts.starXOffset,
          starY = svgSpatialInfo.cy + viewConsts.nodeIconsConstYOffset
            + (numEls-1)*viewConsts.nodeIconsPerYOffset + viewConsts.starYOffset;
      starG.attr("transform",
                 "translate(" + starX + "," + starY + ") "
                 + "scale(" + viewConsts.starGScale + ")");
    };

    /**
     * Add the check mark and associated properties to the given node
     * TODO refactor with addStar
     */
    pvt.addCheckMark = function(d3node, svgSpatialInfo){
      var viewConsts = pvt.consts,
          thisView = this,
          nodeId = d3node.attr("id"),
          mnode = thisView.model.get("nodes").get(nodeId),
          checkHoveredClass = viewConsts.checkHoveredClass,
          nodeLearnedClass = viewConsts.nodeLearnedClass,
          aux = window.agfkGlobals.auxModel;
      svgSpatialInfo = svgSpatialInfo || Utils.getSpatialNodeInfo(d3node.node());

      var chkG = d3node.append("g")
            .attr("class", viewConsts.checkClass)
            .attr("id", pvt.getCheckIdForNode.call(thisView, d3node))
            .on("click", function() {
              // stop the event from firing on the ellipse
              d3.event.stopPropagation();
              // change the learned status on the node model
              aux.toggleLearnedStatus(nodeId);
              // mnode.setLearnedStatus(!d3node.classed(nodeLearnedClass));
            })
            .on("mouseover", function() {
              d3.select(this).classed(checkHoveredClass, true);
            })
            .on("mouseout", function() {
              d3.select(this).classed(checkHoveredClass, false);
            });
      chkG.append("circle")
        .attr("r", viewConsts.checkCircleR);
      chkG.append("path")
        .attr("d", viewConsts.checkPath);

      var numEls = d3node.selectAll("text")[0].length,
          chkX = svgSpatialInfo.cx + viewConsts.checkXOffset,
          chkY = svgSpatialInfo.cy + viewConsts.nodeIconsConstYOffset
            + (numEls-1)*viewConsts.nodeIconsPerYOffset; // TODO move hardcoding
      chkG.attr("transform",
                "translate(" + chkX + "," + chkY + ") "
                + "scale(" + viewConsts.checkGScale + ")");
    };

    /**
     * Helper function to obtain checkmark element for the given node
     */
    pvt.getCheckIdForNode = function(node) {
      return pvt.getIdOfNodeType.call(this, node) + pvt.consts.checkNodeIdSuffix;
    };

    /**
     * Helper function to obtain el-icon element for the given node
     */
    pvt.getELIconIdForNode = function(node) {
      return pvt.getIdOfNodeType.call(this, node) + pvt.consts.elIconNodeIdSuffix;
    };

    /**
     * Helper function to obtain checkmark element for the given node
     */
    pvt.getStarIdForNode = function(node) {
      return pvt.getIdOfNodeType.call(this, node) + pvt.consts.starNodeIdSuffix;
    };
    /**
     * Helper function to obtain id of summary txt div for a given node in the exporation view
     */
    pvt.getSummaryIdForDivTxt = function(node) {
      return pvt.getIdOfNodeType.call(this, node) + pvt.consts.summaryDivSuffix;
    };

    /**
     * Helper function to obtain id of wrapper div of summary txt for a given node in the exporation view
     */
    pvt.getSummaryIdForDivWrap = function(node) {
      return pvt.getIdOfNodeType.call(this, node) + pvt.consts.summaryWrapDivSuffix;
    };

    /**
     * Get id of node element (d3, dom, or model)
     */
    pvt.getIdOfNodeType = function(node) {
      var nodeFun = node.attr || node.getAttribute || node.get;
      return nodeFun.call(node, "id");
    };

    /**
     * return public object
     */
    return Backbone.View.extend({
      // id of view element (div unless tagName is specified)
      id: pvt.consts.viewId,

      // most events are handled via d3; this is awkward for backbone, but jQuery isn't as reliable/east for SVG events
      // TODO try to be consistent with event handling
      events: {
        "click .e-to-l-icon": "handleEToLConceptClick"
      },

      handleNewCircles: function (newGs) {
        var thisView = this,
            thisNodes = thisView.model.getNodes(),
            aux = window.agfkGlobals.auxModel;

        // attach listeners here FIXME do we have to attach these individually here?
        newGs.on("mouseover", function() {
          thisView.circleMouseOver.call(thisView, this);
        })
          .on("mouseout", function() {
            thisView.circleMouseOut.call(thisView, this);
          });

        // FIXME this will likely need to be refactored
        _.each(thisNodes.filter(function(nde){return aux.conceptIsLearned(nde.id);}), function(mnode){
          addPropFunction(mnode, "learned");
        });
        _.each(thisNodes.filter(function(nde){return nde.getImplicitLearnStatus();}), function(mnode){
          addPropFunction(mnode, "implicitLearned");
        });
        _.each(thisNodes.filter(function(nde){return aux.conceptIsStarred(nde.id);}), function(mnode){
          addPropFunction(mnode, "starred");
        });

        // short helper function only needed above FIXME this should be moved to pvt and should probably use a global function for selecting a node element
        function addPropFunction(mdl, prop){
          var d3node = d3.select(thisView.getCircleGId(mdl));
          if (d3node.node() !== null){
            thisView.toggleNodeProps(d3node, true, prop);
          }
        }
      },

      /**
       * Add visual mouse over properties to the explore nodes
       */
      circleMouseOver: function(nodeEl) {
        var thisView = this,
            viewConsts = pvt.consts,
            hoveredClass = viewConsts.hoveredClass,
            d3node = d3.select(nodeEl);

        if (d3node.classed(hoveredClass)){
          d3node.classed(hoveredClass, true);
          return false;
        }

        var nodeId = nodeEl.id;

        // add the appropriate class
        d3node.classed(hoveredClass, true);

        // add node summary if not already present
        if (pvt.summaryTOKillList.hasOwnProperty(nodeId)){
          window.clearInterval(pvt.summaryTOKillList[nodeId]);
          delete pvt.summaryTOKillList[nodeId];
        }
        pvt.attachNodeSummary.call(thisView, d3node);

        var nodeSpatialInfo = null;
        // add node-hoverables if not already present
        if (!d3node.attr(viewConsts.dataHoveredProp)) {
          // add checkmark if not present
          nodeSpatialInfo = nodeSpatialInfo || Utils.getSpatialNodeInfo(nodeEl);
          if (d3node.select("." + viewConsts.checkClass).node() === null){
            pvt.addCheckMark.call(thisView, d3node, nodeSpatialInfo);
          }
          // add node star if not already present
          if (d3node.select("." + viewConsts.starClass).node() === null){
            nodeSpatialInfo = nodeSpatialInfo || Utils.getSpatialNodeInfo(nodeEl);
            pvt.addStar.call(thisView, d3node, nodeSpatialInfo);
          }

          // add e-to-l button if not already present
          if (d3node.select("." + viewConsts.elIconClass).node() === null){
            nodeSpatialInfo = nodeSpatialInfo || Utils.getSpatialNodeInfo(nodeEl);
            pvt.addEToLIcon.call(thisView, d3node, nodeSpatialInfo);
          }
          d3node.attr(viewConsts.dataHoveredProp, true);
        }
        return 0;
      },

      /**
       * Remove mouse over properties from the explore nodes
       */
      circleMouseOut:  function(nodeEl) {
        var relTarget = d3.event.relatedTarget;

        // check if we're in a semantically related el
        if (!relTarget || $.contains(nodeEl, relTarget) || (relTarget.id && relTarget.id.match(nodeEl.id))){
          return;
        }

        var thisView = this,
            d3node = d3.select(nodeEl),
            summId = pvt.getSummaryIdForDivWrap.call(thisView, d3node),
            viewConsts = pvt.consts,
            hoveredClass = viewConsts.hoveredClass,
            nodeId = nodeEl.id;

        if(pvt.summaryTOStartList.hasOwnProperty(nodeId)){
          window.clearInterval(pvt.summaryTOStartList[nodeId]);
          delete pvt.summaryTOStartList[nodeId];
          d3node.classed(hoveredClass, false);
        }
        else{
          // wait a bit before removing the summary
          pvt.summaryTOKillList[nodeId] = window.setTimeout(function(){
            delete pvt.summaryTOKillList[nodeId];
            if (pvt.summaryDisplays[summId] && !pvt.summaryDisplays[summId].$wrapDiv.hasClass(hoveredClass)){
              d3.select("#" + summId).remove(); // use d3 remove for x-browser support
              delete pvt.summaryDisplays[summId];
              d3node.classed(hoveredClass, false);
            }
          }, viewConsts.summaryHideDelay);
        }
      },

      /**
       * @Override
       * setup the appropriate event listers -- this should probably be called on initial render?
       */
      firstRender: function(){
      // build initial graph based on input collection
      var thisView = this,
          d3Svg = thisView.d3Svg,
          nodes = thisView.model.get("nodes"),
          aux = window.agfkGlobals.auxModel,
          gConsts = aux.getConsts();

      // dim nodes that are [implicitly] learned
      thisView.listenTo(aux, gConsts.learnedTrigger, function(nodeId, nodeSid, status){
        var d3El = d3Svg.select("#" + nodeId);
        if (d3El.node() !== null){
          thisView.toggleNodeProps(d3El, status, "learned", d3Svg);
        }
      });
      // handle starred nodes
      thisView.listenTo(aux, gConsts.starredTrigger, function(nodeId, nodeSid, status){
        var d3El = d3Svg.select("#" + nodeId);
        if (d3El.node() !== null){
          thisView.toggleNodeProps(d3El, status, "starred", d3Svg);
        }
      });
      thisView.listenTo(nodes, "change:implicitLearnStatus", function(nodeId, nodeSid, status){
        var d3El = d3Svg.select("#" + nodeId);
        if (d3El.node() !== null){
          thisView.toggleNodeProps(d3El, status, "implicitLearned", d3Svg);
        }
      });

      // rerender graph (for now) when clearing learned nodes (FIXME is this consistent with the graph-view?)
      // thisView.listenTo(thisView.model.get("options"), "change:showLearnedConcepts", thisView.render); // FIXME
    },



      /**
       * Toggle propType properties for the given explore node
       * d3node: d3 selection for the given node
       * toggleOn: whether to toggle on (true) or off (false) the learned properties
       * propType: specify the property type: "learned", "implicitLearned", "starred"
       */
      toggleNodeProps: function(d3node, toggleOn, propType){
        var viewConsts = pvt.consts,
            thisView = this,
            mnode = thisView.model.get("nodes").get(d3node.attr("id")),
            changeLearnStatus = propType === "learned" || propType === "implicitLearned",
            d3Svg = thisView.d3Svg;
        var propClass = {"learned": viewConsts.nodeLearnedClass,
                         "implicitLearned": viewConsts.nodeImplicitLearnedClass,
                         "starred": viewConsts.starredClass
                        }[propType];


        if (changeLearnStatus){
          var hasCheck = d3node.select("." + viewConsts.checkClass).node() !== null;
          // insert checkmark if needed
          if (propType === "learned" && toggleOn && !hasCheck){
            pvt.addCheckMark.call(thisView, d3node);
          }
          // toggle appropriate class for outlinks and inlinks
          thisView.changeEdgesClass(mnode.get("outlinks"), propClass, toggleOn, d3Svg);
          thisView.changeEdgesClass(mnode.get("dependencies"), propClass, toggleOn, d3Svg);
        }
        else{
          var hasStar =  d3node.select("." + viewConsts.starClass).node() !== null;
          if (toggleOn && !hasStar){
            pvt.addStar.call(thisView, d3node);
          }
        }

        d3node.classed(propClass, toggleOn);
      },

      /**
       * Change the class of the provided edge models
       * @param edgeCollections: a collection of DirectedEdge models
       * @param className: name of class to add/remove
       * @param addClass: true to add class, false to remove
       */
      changeEdgesClass: function(edgeCollections, className, addClass, d3Sel){
        var thisView = this,
            d3edge;
        edgeCollections.each(function(edge){
          d3edge = thisView.getD3PathGFromModel(edge);
          if (d3edge.node() !== null){
            d3edge.classed(className, addClass);
          }
        });
        return true;
      },

      /**
       * Handle explore-to-learn view event that focuses on the clicked concept
       *
       * @param evt: the click event
       */
      handleEToLConceptClick: function(evt){
        var imgEl = evt.currentTarget,
            conceptTag = imgEl.getAttribute(pvt.consts.dataConceptTagProp);
        this.transferToLearnViewForConcept(conceptTag);
        // simulate mouseout for explore-graph-view consistency
        Utils.simulate(imgEl.parentNode, "mouseout", {
          relatedTarget: document
        });
      },

      /**
       * Trigger transfer from explore view to learn view and focus on conceptTag
       *
       * @param conceptTag: the tag of the concept to show in the learn view
       */
      transferToLearnViewForConcept: function(conceptTag){
        this.appRouter.changeUrlParams({mode: "learn", lfocus: conceptTag});
      },

      /**
       * Show the node summary in "hover box" next to the node
       * TODO consider making this a view that monitors the nodes (i.e. event driven)
       */
      showNodeSummary: function(circle) {
        var thisView = this,
            viewConsts = pvt.consts,
            div = document.createElement("div"),
            circleId = circle.attr("id"),
            summaryP = document.createElement("p"),
            summaryTxt;

        // add summary
        summaryTxt = this.model.getNode(circleId).get("summary");
        summaryP.textContent = summaryTxt.length > 0 ? summaryTxt : viewConsts.NO_SUMMARY_MSG;

        div.appendChild(summaryP);
        div.id = pvt.getSummaryIdForDivTxt.call(thisView, circle);
        var $div = $(div);
        $div.addClass(viewConsts.summaryTextClass);

        // add wrapper div so we can use "overflow" pseudo elements
        var wrapDiv = document.createElement("div"),
            d3wrapDiv = d3.select(wrapDiv);
        wrapDiv.id = pvt.getSummaryIdForDivWrap.call(thisView, circle);
        d3wrapDiv.classed(viewConsts.summaryWrapClass, true);

        // place the summary box on the side with the most screen real-estate
        var circleRect = circle.node().getBoundingClientRect(),
            placeLeft = circleRect.left + circleRect.width / 2 > window.innerWidth / 2;
        d3wrapDiv.classed(placeLeft ? viewConsts.summaryRightClass : viewConsts.summaryLeftClass, true);
        wrapDiv.appendChild(div);

        // get/set location of box
        var sumLoc = pvt.getSummaryBoxPlacement(circleRect, placeLeft);
        wrapDiv.style.left = sumLoc.left;
        wrapDiv.style.top = sumLoc.top;
        wrapDiv.style.width = viewConsts.summaryWidth + "px";
        wrapDiv.style.display = "none";

        // add box to document with slight fade-in
        var $wrapDiv = $(wrapDiv);
        pvt.summaryTOStartList[circleId] = window.setTimeout(function(){
          delete pvt.summaryTOStartList[circleId];
          $wrapDiv.appendTo("#" + viewConsts.viewId).fadeIn(viewConsts.summaryFadeInTime);
        }, viewConsts.summaryAppearDelay);

        pvt.summaryDisplays[wrapDiv.id] = {"$wrapDiv": $wrapDiv, "d3circle": circle, "placeLeft": placeLeft};
        return $wrapDiv;
      },


    }); // end Backbone.View.extend({

  })();

});