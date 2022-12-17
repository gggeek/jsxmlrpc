YAHOO.widget.TreeView=function(id){id&&this.init(id)},YAHOO.widget.TreeView.prototype={id:null,_el:null,_nodes:null,locked:!1,_expandAnim:null,_collapseAnim:null,_animCount:0,maxAnim:2,setExpandAnim:function(type){this._expandAnim=YAHOO.widget.TVAnim.isValid(type)?type:null},setCollapseAnim:function(type){this._collapseAnim=YAHOO.widget.TVAnim.isValid(type)?type:null},animateExpand:function(el,node){var tree,a;return!!(this._expandAnim&&this._animCount<this.maxAnim)&&(tree=this,(a=YAHOO.widget.TVAnim.getAnim(this._expandAnim,el,function(){tree.expandComplete(node)}))&&(++this._animCount,this.fireEvent("animStart",{node:node,type:"expand"}),a.animate()),!0)},animateCollapse:function(el,node){var tree,a;return!!(this._collapseAnim&&this._animCount<this.maxAnim)&&(tree=this,(a=YAHOO.widget.TVAnim.getAnim(this._collapseAnim,el,function(){tree.collapseComplete(node)}))&&(++this._animCount,this.fireEvent("animStart",{node:node,type:"collapse"}),a.animate()),!0)},expandComplete:function(node){--this._animCount,this.fireEvent("animComplete",{node:node,type:"expand"})},collapseComplete:function(node){--this._animCount,this.fireEvent("animComplete",{node:node,type:"collapse"})},init:function(id){"string"!=typeof(this.id=id)&&(this._el=id,this.id=this.generateId(id)),this.createEvent("animStart",this),this.createEvent("animComplete",this),this.createEvent("collapse",this),this.createEvent("collapseComplete",this),this.createEvent("expand",this),this.createEvent("expandComplete",this),this._nodes=[],(YAHOO.widget.TreeView.trees[this.id]=this).root=new YAHOO.widget.RootNode(this);YAHOO.widget.LogWriter},draw:function(){var html=this.root.getHtml();this.getEl().innerHTML=html,this.firstDraw=!1},getEl:function(){return this._el||(this._el=document.getElementById(this.id)),this._el},regNode:function(node){this._nodes[node.index]=node},getRoot:function(){return this.root},setDynamicLoad:function(fnDataLoader,iconMode){this.root.setDynamicLoad(fnDataLoader,iconMode)},expandAll:function(){this.locked||this.root.expandAll()},collapseAll:function(){this.locked||this.root.collapseAll()},getNodeByIndex:function(nodeIndex){var n=this._nodes[nodeIndex];return n||null},getNodeByProperty:function(property,value){for(var i in this._nodes){i=this._nodes[i];if(i.data&&value==i.data[property])return i}return null},getNodesByProperty:function(property,value){var i,values=[];for(i in this._nodes){var n=this._nodes[i];n.data&&value==n.data[property]&&values.push(n)}return values.length?values:null},getNodeByElement:function(el){var m,p=el,re=/ygtv([^\d]*)(.*)/;do{if(p&&p.id&&(m=p.id.match(re))&&m[2])return this.getNodeByIndex(m[2])}while((p=p.parentNode)&&p.tagName&&(p.id!==this.id&&"body"!==p.tagName.toLowerCase()));return null},removeNode:function(node,autoRefresh){var p;return!node.isRoot()&&((p=node.parent).parent&&(p=p.parent),this._deleteNode(node),autoRefresh&&p&&p.childrenRendered&&p.refresh(),!0)},_removeChildren_animComplete:function(o){this.unsubscribe(this._removeChildren_animComplete),this.removeChildren(o.node)},removeChildren:function(node){if(node.expanded){if(this._collapseAnim)return this.subscribe("animComplete",this._removeChildren_animComplete,this,!0),void YAHOO.widget.Node.prototype.collapse.call(node);node.collapse()}for(;node.children.length;)this._deleteNode(node.children[0]);node.isRoot()&&YAHOO.widget.Node.prototype.expand.call(node),node.childrenRendered=!1,node.dynamicLoadComplete=!1,node.updateIcon()},_deleteNode:function(node){this.removeChildren(node),this.popNode(node)},popNode:function(node){for(var p=node.parent,a=[],i=0,len=p.children.length;i<len;++i)p.children[i]!=node&&(a[a.length]=p.children[i]);p.children=a,p.childrenRendered=!1,node.previousSibling&&(node.previousSibling.nextSibling=node.nextSibling),node.nextSibling&&(node.nextSibling.previousSibling=node.previousSibling),node.parent=null,node.previousSibling=null,node.nextSibling=null,node.tree=null,delete this._nodes[node.index]},toString:function(){return"TreeView "+this.id},generateId:function(el){var id=el.id;return id||(id="yui-tv-auto-id-"+YAHOO.widget.TreeView.counter,++YAHOO.widget.TreeView.counter),id},onExpand:function(node){},onCollapse:function(node){}},YAHOO.augment(YAHOO.widget.TreeView,YAHOO.util.EventProvider),YAHOO.widget.TreeView.nodeCount=0,YAHOO.widget.TreeView.trees=[],YAHOO.widget.TreeView.counter=0,YAHOO.widget.TreeView.getTree=function(treeId){var t=YAHOO.widget.TreeView.trees[treeId];return t||null},YAHOO.widget.TreeView.getNode=function(treeId,nodeIndex){var t=YAHOO.widget.TreeView.getTree(treeId);return t?t.getNodeByIndex(nodeIndex):null},YAHOO.widget.TreeView.addHandler=function(el,sType,fn){el.addEventListener?el.addEventListener(sType,fn,!1):el.attachEvent&&el.attachEvent("on"+sType,fn)},YAHOO.widget.TreeView.removeHandler=function(el,sType,fn){el.removeEventListener?el.removeEventListener(sType,fn,!1):el.detachEvent&&el.detachEvent("on"+sType,fn)},YAHOO.widget.TreeView.preload=function(e,prefix){prefix=prefix||"ygtv";for(var styles=["tn","tm","tmh","tp","tph","ln","lm","lmh","lp","lph","loading"],sb=[],i=1;i<styles.length;i+=1)sb[sb.length]='<span class="'+prefix+styles[i]+'">&#160;</span>';var f=document.createElement("div"),s=f.style;s.className=prefix+styles[0],s.position="absolute",s.height="1px",s.width="1px",s.top="-1000px",s.left="-1000px",f.innerHTML=sb.join(""),document.body.appendChild(f),YAHOO.widget.TreeView.removeHandler(window,"load",YAHOO.widget.TreeView.preload)},YAHOO.widget.TreeView.addHandler(window,"load",YAHOO.widget.TreeView.preload),YAHOO.widget.Node=function(oData,oParent,expanded){oData&&this.init(oData,oParent,expanded)},YAHOO.widget.Node.prototype={index:0,children:null,tree:null,data:null,parent:null,depth:-1,href:null,target:"_self",expanded:!1,multiExpand:!0,renderHidden:!1,childrenRendered:!1,dynamicLoadComplete:!1,previousSibling:null,nextSibling:null,_dynLoad:!1,dataLoader:null,isLoading:!1,hasIcon:!0,iconMode:0,nowrap:!1,isLeaf:!1,_type:"Node",init:function(oData,oParent,expanded){this.data=oData,this.children=[],this.index=YAHOO.widget.TreeView.nodeCount,++YAHOO.widget.TreeView.nodeCount,this.expanded=expanded,this.createEvent("parentChange",this),oParent&&oParent.appendChild(this)},applyParent:function(parentNode){if(!parentNode)return!1;this.tree=parentNode.tree,this.parent=parentNode,this.depth=parentNode.depth+1,this.href||(this.href="javascript:"+this.getToggleLink()),this.tree.regNode(this),parentNode.childrenRendered=!1;for(var i=0,len=this.children.length;i<len;++i)this.children[i].applyParent(this);return this.fireEvent("parentChange"),!0},appendChild:function(childNode){var sib;return this.hasChildren()&&(((sib=this.children[this.children.length-1]).nextSibling=childNode).previousSibling=sib),(this.children[this.children.length]=childNode).applyParent(this),this.childrenRendered&&this.expanded&&(this.getChildrenEl().style.display=""),childNode},appendTo:function(parentNode){return parentNode.appendChild(this)},insertBefore:function(node){var refIndex,p=node.parent;return p&&(this.tree&&this.tree.popNode(this),refIndex=node.isChildOf(p),p.children.splice(refIndex,0,this),node.previousSibling&&(node.previousSibling.nextSibling=this),this.previousSibling=node.previousSibling,((this.nextSibling=node).previousSibling=this).applyParent(p)),this},insertAfter:function(node){var p=node.parent;if(p){this.tree&&this.tree.popNode(this);var refIndex=node.isChildOf(p);if(!node.nextSibling)return this.nextSibling=null,this.appendTo(p);p.children.splice(refIndex+1,0,this),(node.nextSibling.previousSibling=this).previousSibling=node,this.nextSibling=node.nextSibling,(node.nextSibling=this).applyParent(p)}return this},isChildOf:function(parentNode){if(parentNode&&parentNode.children)for(var i=0,len=parentNode.children.length;i<len;++i)if(parentNode.children[i]===this)return i;return-1},getSiblings:function(){return this.parent.children},showChildren:function(){this.tree.animateExpand(this.getChildrenEl(),this)||this.hasChildren()&&(this.getChildrenEl().style.display="")},hideChildren:function(){this.tree.animateCollapse(this.getChildrenEl(),this)||(this.getChildrenEl().style.display="none")},getElId:function(){return"ygtv"+this.index},getChildrenElId:function(){return"ygtvc"+this.index},getToggleElId:function(){return"ygtvt"+this.index},getEl:function(){return document.getElementById(this.getElId())},getChildrenEl:function(){return document.getElementById(this.getChildrenElId())},getToggleEl:function(){return document.getElementById(this.getToggleElId())},getToggleLink:function(){return"YAHOO.widget.TreeView.getNode('"+this.tree.id+"',"+this.index+").toggle()"},collapse:function(){this.expanded&&!1!==this.tree.onCollapse(this)&&!1!==this.tree.fireEvent("collapse",this)&&(this.getEl()?(this.hideChildren(),this.expanded=!1,this.updateIcon()):this.expanded=!1,this.tree.fireEvent("collapseComplete",this))},expand:function(lazySource){if(!this.expanded||lazySource){var ret=!0;if(!lazySource){if(!1===(ret=this.tree.onExpand(this)))return;ret=this.tree.fireEvent("expand",this)}if(!1!==ret)if(this.getEl())if(this.childrenRendered||(this.getChildrenEl().innerHTML=this.renderChildren()),this.expanded=!0,this.updateIcon(),this.isLoading)this.expanded=!1;else{if(!this.multiExpand)for(var sibs=this.getSiblings(),i=0;i<sibs.length;++i)sibs[i]!=this&&sibs[i].expanded&&sibs[i].collapse();this.showChildren(),this.tree.fireEvent("expandComplete",this)}else this.expanded=!0}},updateIcon:function(){var el;this.hasIcon&&(el=this.getToggleEl())&&(el.className=this.getStyle())},getStyle:function(){var type;return this.isLoading?"ygtvloading":(type="n","ygtv"+(this.nextSibling?"t":"l")+(type=this.hasChildren(!0)||this.isDynamic()&&!this.getIconMode()?this.expanded?"m":"p":type))},getHoverStyle:function(){var s=this.getStyle();return this.hasChildren(!0)&&!this.isLoading&&(s+="h"),s},expandAll:function(){for(var i=0;i<this.children.length;++i){var c=this.children[i];if(c.isDynamic()){alert("Not supported (lazy load + expand all)");break}if(!c.multiExpand){alert("Not supported (no multi-expand + expand all)");break}c.expand(),c.expandAll()}},collapseAll:function(){for(var i=0;i<this.children.length;++i)this.children[i].collapse(),this.children[i].collapseAll()},setDynamicLoad:function(fnDataLoader,iconMode){fnDataLoader?(this.dataLoader=fnDataLoader,this._dynLoad=!0):(this.dataLoader=null,this._dynLoad=!1),iconMode&&(this.iconMode=iconMode)},isRoot:function(){return this==this.tree.root},isDynamic:function(){return!this.isLeaf&&!this.isRoot()&&(this._dynLoad||this.tree.root._dynLoad)},getIconMode:function(){return this.iconMode||this.tree.root.iconMode},hasChildren:function(checkForLazyLoad){return!this.isLeaf&&(0<this.children.length||checkForLazyLoad&&this.isDynamic()&&!this.dynamicLoadComplete)},toggle:function(){this.tree.locked||!this.hasChildren(!0)&&!this.isDynamic()||(this.expanded?this.collapse():this.expand())},getHtml:function(){this.childrenRendered=!1;var sb=[];return sb[sb.length]='<div class="ygtvitem" id="'+this.getElId()+'">',sb[sb.length]=this.getNodeHtml(),sb[sb.length]=this.getChildrenHtml(),sb[sb.length]="</div>",sb.join("")},getChildrenHtml:function(){var sb=[];return sb[sb.length]='<div class="ygtvchildren"',sb[sb.length]=' id="'+this.getChildrenElId()+'"',this.expanded&&this.hasChildren()||(sb[sb.length]=' style="display:none;"'),sb[sb.length]=">",(this.hasChildren(!0)&&this.expanded||this.renderHidden&&!this.isDynamic())&&(sb[sb.length]=this.renderChildren()),sb[sb.length]="</div>",sb.join("")},renderChildren:function(){var node=this;if(!this.isDynamic()||this.dynamicLoadComplete)return this.completeRender();if(this.isLoading=!0,this.tree.locked=!0,this.dataLoader)setTimeout(function(){node.dataLoader(node,function(){node.loadComplete()})},10);else{if(!this.tree.root.dataLoader)return"Error: data loader not found or not specified.";setTimeout(function(){node.tree.root.dataLoader(node,function(){node.loadComplete()})},10)}return""},completeRender:function(){for(var sb=[],i=0;i<this.children.length;++i)sb[sb.length]=this.children[i].getHtml();return this.childrenRendered=!0,sb.join("")},loadComplete:function(){this.getChildrenEl().innerHTML=this.completeRender(),this.dynamicLoadComplete=!0,this.isLoading=!1,this.expand(!0),this.tree.locked=!1},getAncestor:function(depth){if(depth>=this.depth||depth<0)return null;for(var p=this.parent;p.depth>depth;)p=p.parent;return p},getDepthStyle:function(depth){return this.getAncestor(depth).nextSibling?"ygtvdepthcell":"ygtvblankdepthcell"},getNodeHtml:function(){return""},refresh:function(){var el;this.getChildrenEl().innerHTML=this.completeRender(),this.hasIcon&&(el=this.getToggleEl())&&(el.className=this.getStyle())},toString:function(){return"Node ("+this.index+")"}},YAHOO.augment(YAHOO.widget.Node,YAHOO.util.EventProvider),YAHOO.widget.TextNode=function(oData,oParent,expanded){oData&&(this.init(oData,oParent,expanded),this.setUpLabel(oData))},YAHOO.extend(YAHOO.widget.TextNode,YAHOO.widget.Node,{labelStyle:"ygtvlabel",labelElId:null,label:null,textNodeParentChange:function(){this.tree&&!this.tree.hasEvent("labelClick")&&this.tree.createEvent("labelClick",this.tree)},setUpLabel:function(oData){this.textNodeParentChange(),this.subscribe("parentChange",this.textNodeParentChange),this.label=(oData="string"==typeof oData?{label:oData}:oData).label,this.data.label=oData.label,oData.href&&(this.href=encodeURI(oData.href)),oData.target&&(this.target=oData.target),oData.style&&(this.labelStyle=oData.style),oData.title&&(this.title=oData.title),this.labelElId="ygtvlabelel"+this.index},getLabelEl:function(){return document.getElementById(this.labelElId)},getNodeHtml:function(){var sb=[];sb[sb.length]='<table border="0" cellpadding="0" cellspacing="0">',sb[sb.length]="<tr>";for(var i=0;i<this.depth;++i)sb[sb.length]='<td class="'+this.getDepthStyle(i)+'"><div class="ygtvspacer"></div></td>';var getNode="YAHOO.widget.TreeView.getNode('"+this.tree.id+"',"+this.index+")";return sb[sb.length]="<td",sb[sb.length]=' id="'+this.getToggleElId()+'"',sb[sb.length]=' class="'+this.getStyle()+'"',this.hasChildren(!0)&&(sb[sb.length]=' onmouseover="this.className=',sb[sb.length]=getNode+'.getHoverStyle()"',sb[sb.length]=' onmouseout="this.className=',sb[sb.length]=getNode+'.getStyle()"'),sb[sb.length]=' onclick="javascript:'+this.getToggleLink()+'">',sb[sb.length]='<div class="ygtvspacer">',sb[sb.length]="</div>",sb[sb.length]="</td>",sb[sb.length]="<td ",sb[sb.length]=this.nowrap?' nowrap="nowrap" ':"",sb[sb.length]=" >",sb[sb.length]="<a",sb[sb.length]=' id="'+this.labelElId+'"',this.title&&(sb[sb.length]=' title="'+this.title+'"'),sb[sb.length]=' class="'+this.labelStyle+'"',sb[sb.length]=' href="'+this.href+'"',sb[sb.length]=' target="'+this.target+'"',sb[sb.length]=' onclick="return '+getNode+".onLabelClick("+getNode+')"',this.hasChildren(!0)&&(sb[sb.length]=" onmouseover=\"document.getElementById('",sb[sb.length]=this.getToggleElId()+"').className=",sb[sb.length]=getNode+'.getHoverStyle()"',sb[sb.length]=" onmouseout=\"document.getElementById('",sb[sb.length]=this.getToggleElId()+"').className=",sb[sb.length]=getNode+'.getStyle()"'),sb[sb.length]=" >",sb[sb.length]=this.label,sb[sb.length]="</a>",sb[sb.length]="</td>",sb[sb.length]="</tr>",sb[sb.length]="</table>",sb.join("")},onLabelClick:function(me){return me.tree.fireEvent("labelClick",me)},toString:function(){return"TextNode ("+this.index+") "+this.label}}),YAHOO.widget.RootNode=function(oTree){this.init(null,null,!0),this.tree=oTree},YAHOO.extend(YAHOO.widget.RootNode,YAHOO.widget.Node,{getNodeHtml:function(){return""},toString:function(){return"RootNode"},loadComplete:function(){this.tree.draw()},collapse:function(){},expand:function(){}}),YAHOO.widget.HTMLNode=function(oData,oParent,expanded,hasIcon){oData&&(this.init(oData,oParent,expanded),this.initContent(oData,hasIcon))},YAHOO.extend(YAHOO.widget.HTMLNode,YAHOO.widget.Node,{contentStyle:"ygtvhtml",contentElId:null,html:null,initContent:function(oData,hasIcon){this.setHtml(oData),this.contentElId="ygtvcontentel"+this.index,this.hasIcon=hasIcon},setHtml:function(o){this.data=o,this.html="string"==typeof o?o:o.html;var el=this.getContentEl();el&&(el.innerHTML=this.html)},getContentEl:function(){return document.getElementById(this.contentElId)},getNodeHtml:function(){var sb=[];sb[sb.length]='<table border="0" cellpadding="0" cellspacing="0">',sb[sb.length]="<tr>";for(var i=0;i<this.depth;++i)sb[sb.length]='<td class="'+this.getDepthStyle(i)+'"><div class="ygtvspacer"></div></td>';return this.hasIcon&&(sb[sb.length]="<td",sb[sb.length]=' id="'+this.getToggleElId()+'"',sb[sb.length]=' class="'+this.getStyle()+'"',sb[sb.length]=' onclick="javascript:'+this.getToggleLink()+'"',this.hasChildren(!0)&&(sb[sb.length]=' onmouseover="this.className=',sb[sb.length]="YAHOO.widget.TreeView.getNode('",sb[sb.length]=this.tree.id+"',"+this.index+').getHoverStyle()"',sb[sb.length]=' onmouseout="this.className=',sb[sb.length]="YAHOO.widget.TreeView.getNode('",sb[sb.length]=this.tree.id+"',"+this.index+').getStyle()"'),sb[sb.length]='><div class="ygtvspacer"></div></td>'),sb[sb.length]="<td",sb[sb.length]=' id="'+this.contentElId+'"',sb[sb.length]=' class="'+this.contentStyle+'"',sb[sb.length]=this.nowrap?' nowrap="nowrap" ':"",sb[sb.length]=" >",sb[sb.length]=this.html,sb[sb.length]="</td>",sb[sb.length]="</tr>",sb[sb.length]="</table>",sb.join("")},toString:function(){return"HTMLNode ("+this.index+")"}}),YAHOO.widget.MenuNode=function(oData,oParent,expanded){oData&&(this.init(oData,oParent,expanded),this.setUpLabel(oData)),this.multiExpand=!1},YAHOO.extend(YAHOO.widget.MenuNode,YAHOO.widget.TextNode,{toString:function(){return"MenuNode ("+this.index+") "+this.label}}),YAHOO.widget.TVAnim={FADE_IN:"TVFadeIn",FADE_OUT:"TVFadeOut",getAnim:function(type,el,callback){return YAHOO.widget[type]?new YAHOO.widget[type](el,callback):null},isValid:function(type){return YAHOO.widget[type]}},YAHOO.widget.TVFadeIn=function(el,callback){this.el=el,this.callback=callback},YAHOO.widget.TVFadeIn.prototype={animate:function(){var tvanim=this,s=this.el.style,s=(s.opacity=.1,s.filter="alpha(opacity=10)",s.display="",new YAHOO.util.Anim(this.el,{opacity:{from:.1,to:1,unit:""}},.4));s.onComplete.subscribe(function(){tvanim.onComplete()}),s.animate()},onComplete:function(){this.callback()},toString:function(){return"TVFadeIn"}},YAHOO.widget.TVFadeOut=function(el,callback){this.el=el,this.callback=callback},YAHOO.widget.TVFadeOut.prototype={animate:function(){var tvanim=this,a=new YAHOO.util.Anim(this.el,{opacity:{from:1,to:.1,unit:""}},.4);a.onComplete.subscribe(function(){tvanim.onComplete()}),a.animate()},onComplete:function(){var s=this.el.style;s.display="none",s.filter="alpha(opacity=100)",this.callback()},toString:function(){return"TVFadeOut"}},YAHOO.register("treeview",YAHOO.widget.TreeView,{version:"2.5.0",build:"895"});