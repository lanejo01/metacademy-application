�
�pnSc           @   sj   d  d l  m Z d  d l m Z d  d l m Z d  d l m Z d  d l	 m
 Z
 d e f d �  �  YZ d S(	   i����(   t   datetime_utils(   t   db(   t   DataMigration(   t   models(   t   TESTINGt	   Migrationc           B   sz  e  Z d  �  Z d �  Z i i i d d 6d 6d g  i d d 6f d 6d	 g  i d d
 6d d 6f d 6d g  i d d 6d d 6d d 6f d 6d 6i i d d 6d d 6d d 6d 6d	 g  i d d 6f d 6d g  i d d 6f d 6d g  i d d 6f d 6d	 g  i d  d 6f d 6d! 6i i d" d 6d 6d# g  i d$ d% 6f d& 6d' g  i d( d 6d d 6f d) 6d	 g  i d* d 6d d 6f d+ 6d g  i d d 6d, d- 6d d 6d. d 6f d/ 6d g  i d d 6f d 6d0 g  i d d% 6f d1 6d0 g  i d d% 6f d2 6d0 g  i d d% 6f d3 6d# g  i d$ d% 6f d4 6d	 g  i d* d 6d d 6f d5 6d	 g  i d6 d 6f d7 6d g  i d d 6d, d- 6d d 6d d 6f d8 6d	 g  i d d
 6d* d 6f d9 6d: 6i i d; d 6d< d 6d= d 6d> d? 6d 6d	 g  i d d 6f d@ 6d g  i d d 6f d 6d	 g  i d d 6f dA 6d	 g  i d d 6f d 6dB 6i i dC d 6d 6d	 g  i dD d 6d dE 6d d 6f dF 6d	 g  i dG d 6d d 6f dH 6d0 g  i d d% 6f dI 6dJ g  i d dE 6d d 6f dK 6d	 g  i dD d 6d dE 6d d 6f dL 6d	 g  i dD d 6d dE 6d d 6f dM 6d	 g  i dN d 6d dE 6d d 6f dO 6d	 g  i d d
 6d* d 6f dP 6d	 g  i d d 6f dQ 6dR g  i dS d% 6d dE 6d d 6f dT 6dU 6i i dV d 6d 6d	 g  i dW d 6f dX 6d	 g  i dY d 6d dE 6d d 6f dZ 6d g  i d[ d- 6d\ d 6f d] 6d0 g  i d d% 6f d^ 6d	 g  i d d 6d dE 6d d 6f d_ 6d g  i d` d- 6da d 6f db 6d g  i d d 6dc d- 6d dE 6d d 6dd d 6f de 6d	 g  i dG d 6d d 6f dH 6d	 g  i df d 6d dE 6d d 6f dg 6dR g  i dS d% 6d dE 6d d 6f dT 6dh 6i i di d 6d 6dj g  i d\ d 6d d
 6d d 6f d] 6d g  i dk d- 6d d 6dl d 6f dm 6d	 g  i d d 6f dn 6do 6i i dp d 6d 6d	 g  i dq d 6d d 6f dH 6d	 g  i df d 6f dr 6d g  i ds d- 6d\ d 6f dt 6d g  i du d- 6d d 6dd d 6f dv 6d g  i dw d- 6d\ d 6f dx 6d g  i dy d- 6d d 6dd d 6f dz 6d{ 6i i d| d 6d 6d	 g  i dW d 6f dX 6d	 g  i d} d 6d dE 6d d 6f d~ 6d	 g  i d d 6f d 6d	 g  i d d 6d dE 6d d 6f d� 6d	 g  i dG d 6d d 6f dH 6d	 g  i d} d 6f dg 6d	 g  i d d 6f d� 6d	 g  i d d 6f dQ 6d	 g  i d} d 6f d� 6dR g  i dS d% 6d dE 6d d 6f dT 6dR g  i d dE 6d d 6f d� 6d� 6i i d� d 6d 6d g  i d� d- 6d\ d 6f d] 6d	 g  i dG d 6d d 6f dH 6d	 g  i df d 6f d� 6d� 6i i d� d 6d 6d g  i d� d- 6d d 6d\ d 6f d� 6d g  i d� d- 6d d 6d� d 6f d� 6d	 g  i dG d 6d d 6f dH 6d	 g  i d d 6f dQ 6d� 6i i d� d 6d 6d g  i d� d- 6d d 6dl d 6f dm 6dj g  i d� d 6d d
 6f d� 6d g  i d d 6f d 6d� 6i i d� d 6d 6d g  i d� d- 6d� d 6f d� 6d	 g  i dG d 6d d 6f dH 6d	 g  i d d 6d dE 6d d 6f d� 6d	 g  i d* d 6f d� 6d	 g  i d d 6d dE 6d d 6f d� 6dR g  i dS d% 6d dE 6d d 6f dT 6d� 6i i d� d 6d 6d g  i d� d- 6d d 6d\ d 6f d� 6d g  i d� d- 6d d 6d� d 6f d� 6dj g  i d� d- 6d d
 6d d 6d\ d 6f d� 6d� 6i i d� d 6d 6dj g  i d� d 6d d
 6d d 6f d� 6d� 6Z d� g Z e Z RS(�   c         C   s�   d d l  m } t s� t } xu t r� t d � } | s; Pn  | d k rR d GHq n  | d k sj | d k rn Pn  | d k s� | d k r t } Pq q W| r� d	 GH| d
 d � q� n  d S(   s!   Write your forwards methods here.i����(   t   call_commands,   Populate the db with metacademy data [Y/n]? t   yt   Yt   nt   Ns   please enter y or n.s   loading graph data t   loaddatas   graph_fixture.jsonN(   R   R   R	   R
   (   t   django.core.managementR   R   t   Truet	   raw_inputt   False(   t   selft   ormR   t   loadt   ans(    (    sl   /Users/cjrd/Dropbox/Metacademy/metacademy-application/app_server/apps/graph/migrations/0002_load_initdata.pyt   forwards   s$    	c         C   s   d S(   s"   Write your backwards methods here.N(    (   R   R   (    (    sl   /Users/cjrd/Dropbox/Metacademy/metacademy-application/app_server/apps/graph/migrations/0002_load_initdata.pyt	   backwards!   s    t   Groupt   object_namet   Metas!   django.db.models.fields.AutoFieldR   t   primary_keyu   ids!   django.db.models.fields.CharFieldt   uniquet   80t
   max_lengtht   names/   django.db.models.fields.related.ManyToManyFieldu   orm['auth.Permission']t   toR   t   symmetricalt   blankt   permissionsu
   auth.groupsA   (u'content_type__app_label', u'content_type__model', u'codename')t   orderings!   ((u'content_type', u'codename'),)t   unique_togethert
   Permissiont   100t   codenames*   django.db.models.fields.related.ForeignKeyu   orm['contenttypes.ContentType']t   content_typet   50u   auth.permissiont   Users%   django.db.models.fields.DateTimeFields   datetime.datetime.nowt   defaultt   date_joineds"   django.db.models.fields.EmailFieldt   75t   emailt   30t
   first_names   u'user_set't   related_nameu   orm['auth.Group']t   groupss$   django.db.models.fields.BooleanFieldt	   is_activet   is_stafft   is_superusert
   last_logint	   last_namet   128t   passwordt   user_permissionst   usernameu	   auth.users	   ('name',)s   (('app_label', 'model'),)t   ContentTypes   'django_content_type't   db_tablet	   app_labelt   modelu   contenttypes.contenttypet   Conceptt   2000t   nullt	   exercisest   16t   idt   is_shortcuts"   django.db.models.fields.FloatFieldt
   learn_timet   pointerst   softwaret   1000t   summaryt   tagt   titles$   django.db.models.fields.IntegerFieldt   0t   version_numu   graph.conceptt   ConceptResourcet   4t   accesst   300t   additional_dependenciess   'concept_resource'u   orm['graph.Concept']t   conceptt   coret   editions   'cresources'u   orm['graph.GlobalResource']t   global_resources   'goals_covered'u   orm['graph.Goal']t   goals_coveredt   500t   notesu   graph.conceptresourcet   ConceptSettingss-   django.db.models.fields.related.OneToOneFields   'edited_concept'u   orm['user_management.Profile']t	   edited_byt   statusu   graph.conceptsettingst
   Dependencyt   32t   reasons   'dep_source't   sources   'source_goals't   source_goalss   'dep_target't   targets   'target_goals't   target_goalsu   graph.dependencyt   GlobalResourcet   200t   authorst   descriptiont   edition_yearst   resource_typet   urlt   yearu   graph.globalresourcet   Goals   'goals't   textu
   graph.goalt   Graphs   'graph_concepts't   conceptss   'graph_dependencies'u   orm['graph.Dependency']t   dependenciesu   graph.grapht   GraphSettingss   'edited_graph'u   orm['graph.Graph']t   graphu   graph.graphsettingst   ResourceLocations   'locations'u   orm['graph.ConceptResource']t	   cresourcet   location_textt   location_typeu   graph.resourcelocationt   TargetGraphs   'target_graphs's   'targetgraph_dependencies's   'tgraph_leaf't   leafu   graph.targetgrapht   Profileu   orm['auth.User']t   useru   user_management.profile(   t   __name__t
   __module__R   R   R   t   complete_appsR   R   (    (    (    sl   /Users/cjrd/Dropbox/Metacademy/metacademy-application/app_server/apps/graph/migrations/0002_load_initdata.pyR   	   s�   		),,"#%%%%)%%3%)%%%)%%%"%%%%%)%%0,	N(   t   south.utilsR    t   datetimet   south.dbR   t   south.v2R   t	   django.dbR   t   settingsR   R   (    (    (    sl   /Users/cjrd/Dropbox/Metacademy/metacademy-application/app_server/apps/graph/migrations/0002_load_initdata.pyt   <module>   s
   