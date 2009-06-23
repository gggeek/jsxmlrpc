/**
 * JS-XMLRPC: Yet Another XMLRPC / JSON(RPC) Library, in Javascript!
 *
 * Extension of Yahoo YUI Treeview component, used for rendering and editing
 * nested structures of xmlrpcvals/json vals
 *
 * @version $Id: xmlrpc_display.js,v 1.5 2008/03/07 16:57:53 ggiunta Exp $
 * @author Gaetano Giunta
 * @copyright (c) 2007-2009 G. Giunta
 * @license code licensed under the BSD License: http://phpxmlrpc.sourceforge.net/jsxmlrpc/license.txt
 *
 * @todo (optionally) warn user if changing type of a struct/array which has children
 * @todo warn user (optionally) on value fixup when editing single value
 * @todo add a way to have NULL as valid type when editing xmlrpc (ie. support the nil extension)
 *
 * @todo add support for xmlrpcparam values, instead of using 'node' 0 to identify it (?)
 * @todo use this.labelStyle instead of hardcoded 'ygtvmv' for styles???
 * @todo use xmlrpcval functions to access children instead of .me, .mytype
 * @todo smarter tree redawing: rebuild only the subtree needed
 * @todo find a smarter way to keep tooltips appearing after node buttons have been hidden + shown again...
 * @todo rewrite manipulation of values functions using indexOf(). In case of IE, Array has been extended...
 * @todo the tree preloads the standard tree images (via stylesheet). we should do the same for our custom images
 * @todo restrict tabbing to stay in dlg component, plus do not accept ESC, ENTER when on select box
 * @todo use yui dlg for alert() in case user done sumtin' wrong
 * @todo add drag'n'drop support for element reordering instead of up/down arrows
 * @todo instead of using a pre-built html element for editing dialog, build one on our own
 * @todo reduce the number of global variables
 */

/** user editable vars, to customize behaviour of tree component */
	/// show a confirmation dialog before deleting elements
	var askDeleteConfirmation = true;

	/// the html element used as placeholder for the yui dialogs
	var editElementDiv = 'dlgpanel2';

	/// allow top level elements to have their type changed
	var allowTopLevelElementTypeChange = false;

	/// when set to true, struct elements with an empty name will be refused
	var preventAnonStructEelements = false;

	//var knownValueTypes = '12345678'; // for xmlrpc use 12345678; for json use 123569

	// wheter the tree will be built out of xmlrpcvals or jsonrpvals
	var elementType = 'xmlrpcval'; // or jsonrpcval


/* global vars used internally by the lib */
/** arrays of element ids used to dinamically add tooltips to all node buttons */
	var moveUpButtons = [];
	var moveDownButtons = [];
	var removeButtons = [];
	var addButtons = [];
	var editButtons = [];

	var upToolTip = null;
	var downToolTip = null;
	var addToolTip = null;
	var removeToolTip = null;
	var editToolTip = null;

/** dialog to confirm deletion of a node, with a global var holding node id */
	var editingElement = null;
	var deleteConfirmDlg;
	var editDlg;


/**
 * A customized node presentation.  The first parameter should be
 * an xmlrpcval (or descendant ) object
 * @namespace YAHOO.widget
 * @class XMLRPCNode
 * @extends YAHOO.widget.Node
 * @constructor
 * @param oData {object} an object containing the data that will
 * be used to render this node
 * @param oParent {YAHOO.widget.Node} this node's parent node
 * @param expanded {boolean} the initial expanded/collapsed state
 * @param name {string} the string label attached to this node (for struct member nodes)
 * @param editable {boolean} if true, allow modifications to element
 */
YAHOO.widget.XMLRPCNode = function(oData, oParent, expanded, name, editable) {

	if (oData) {
		this.init(oData, oParent, expanded);
		this.initContent(oData, expanded, name, editable);
	}

};

YAHOO.extend(YAHOO.widget.XMLRPCNode, YAHOO.widget.Node, {

	/**
	 * The CSS class for the label href.  Defaults to ygtvlabel, but can be
	 * overridden to provide a custom presentation for a specific node.
	 * @property labelStyle
	 * @type string
	 */
	labelStyle: "ygtvlabel",

	/**
	 * The derived element ids of the label for this node
	 * @type string
	 */
	labelElId: null,
	typeElId: null,
	nameElId: null,

	/**
	 * The text for the element name (used for painting struct val children elements).
	 * @property html
	 * @type string
	 */
	html: null,

	/// set to true to have the node display buttons for editing it
	editable: false,


	/// @todo: verify if this is used or it can be ripped off; nothing happens normally when clicking on label (editing is done by clickig on icons...)
	textNodeParentChange: function() {

		/**
		 * Custom event that is fired when the text node label is clicked.  The
		 * custom event is defined on the tree instance, so there is a single
		 * event that handles all nodes in the tree.  The node clicked is
		 * provided as an argument
		 *
		 * @event labelClick
		 * @for YAHOO.widget.TreeView
		 * @param {YAHOO.widget.Node} node the node clicked
		 */
		if (this.tree && !this.tree.hasEvent("labelClick")) {
			this.tree.createEvent("labelClick", this.tree);
		}

	},

	/**
	 * Sets up the node, fetching data from the xmlrpcval oData. Recurses children!
	 * @method setUpLabel
	 * @param oData an xmlrpcval object
	 */
	initContent: function(oData, expanded, name, editable) {

		// set up the custom event on the tree
		this.textNodeParentChange();
		this.subscribe("parentChange", this.textNodeParentChange);

		/*if (typeof oData == "string") {
			oData = { label: oData };
		}
		this.label = oData.label;*/

		if (editable != undefined) {
			this.editable = editable;
		}

		// 'name' of element is not a property of the xmlrpcval, so we copy it into the node to display it later
		// note that we distinguish an empty name, ie. '' from a no-name element!!!
		if (name === undefined || name === null) {
			this.html = false;
		}
		else {
			this.html = name;
		}

		// build recursively all childern nodes if this xmlrpcval object is array or struct
		if (oData.kindOf() == 'array') {
			for (var i = 0; i < oData.arraySize(); i++) {
				var newnode = new YAHOO.widget.XMLRPCNode(oData.arrayMem(i), this, expanded, null, editable);
			}
			//this.html = '<b>[array]</b>';
			//this.html = oName;
		}
		else if (oData.kindOf() == 'struct') {
			/// @todo implement data hiding via structeach()
			for (var attr in oData.me) {
				var newnode = new YAHOO.widget.XMLRPCNode(oData.me[attr], this, expanded, attr, editable);
			}
			//this.html = '<b>[struct]</b>';
			//this.html = oName;
		}
		else {
			//this.html = oData.me+' <b>['+oData.scalartyp()+']</b>';
			//this.html = oName + oData.me;
		}

		// update the link
		/*if (oData.href) {
			this.href = oData.href;
		}

		// set the target
		if (oData.target) {
			this.target = oData.target;
		}

		if (oData.style) {
			this.labelStyle = oData.style;
		}*/

		// save Ids of elements that could see their content modified later on
		this.labelElId = "ygtvlabelel" + this.index;
		this.typeElId = "ygtvtypeel" + this.index;
		this.nameElId = "ygtvnameel" + this.index;

		// save ids of elements for tooltips
		moveUpButtons[moveUpButtons.length] = 'ygtvu' + this.index;
		moveDownButtons[moveDownButtons.length] = 'ygtvd' + this.index;
		addButtons[addButtons.length] = 'ygtva' + this.index;
		removeButtons[removeButtons.length] = 'ygtvr' + this.index;
		editButtons[editButtons.length] = 'ygtve' + this.index;
	},

	/**
	 * Return the label elements
	 * @for YAHOO.widget.TextNode
	 * @return {object} the element
	 */
	getLabelEl: function() {
		return document.getElementById(this.labelElId);
	},

	getTypeEl: function() {
		return document.getElementById(this.typeElId);
	},

	getNameEl: function() {
		return document.getElementById(this.nameElId);
	},

	// overrides YAHOO.widget.Node
	getNodeHtml: function() {
		var sb = [];

		sb[sb.length] = '<table border="0" cellpadding="0" cellspacing="0">';
		sb[sb.length] = '<tr>';

		// spacing for node depth
		for (var i = 0; i < this.depth; ++i) {
			// sb[sb.length] = '<td class="ygtvdepthcell">&#160;</td>';
			sb[sb.length] = '<td class="' + this.getDepthStyle(i) + '"><div class="ygtvspacer"></div></td>';
		}

		var getNode = 'YAHOO.widget.TreeView.getNode(\'' +
						this.tree.id + '\',' + this.index + ')';

		// node icon
		sb[sb.length] = '<td';
		// sb[sb.length] = ' onselectstart="return false"';
		sb[sb.length] = ' id="' + this.getToggleElId() + '"';
		sb[sb.length] = ' class="' + this.getStyle() + '"';
		if (this.hasChildren(true)) {
			sb[sb.length] = ' onmouseover="this.className=';
			sb[sb.length] = getNode + '.getHoverStyle()"';
			sb[sb.length] = ' onmouseout="this.className=';
			sb[sb.length] = getNode + '.getStyle()"';
		}
		sb[sb.length] = ' onclick="javascript:' + this.getToggleLink() + '">';

		/*
		sb[sb.length] = '<img id="' + this.getSpacerId() + '"';
		sb[sb.length] = ' alt=""';
		sb[sb.length] = ' tabindex=0';
		sb[sb.length] = ' src="' + this.spacerPath + '"';
		sb[sb.length] = ' title="' + this.getStateText() + '"';
		sb[sb.length] = ' class="ygtvspacer"';
		// sb[sb.length] = ' onkeypress="return ' + getNode + '".onKeyPress()"';
		sb[sb.length] = ' />';
		*/
		//sb[sb.length] = '&#160;';
		sb[sb.length] = '<div class="ygtvspacer"/>';
		sb[sb.length] = '</td>';

		if (this.editable) {


		// add link for swapping current item with prev
		sb[sb.length] = '<td';
		if (this.previousSibling != undefined) {
			sb[sb.length] = ' id="ygtvu' + this.index + '"';
			sb[sb.length] = ' class="' + 'ygtvmvup"';
			sb[sb.length] = ' onmouseover="this.className=\'ygtvmvuph\'"';
			//sb[sb.length] = getNode + '.getHoverStyle()+\'_mvup\'"';
			sb[sb.length] = ' onmouseout="this.className=\'ygtvmvup\'"';
			//sb[sb.length] = getNode + '.getStyle()+\'_mvup\'"';
			sb[sb.length] = ' onclick="return ' + getNode + '.onUpClick(' + getNode +')"';
		}
		else {
			sb[sb.length] = ' class="' + 'ygtvmvupn"';
		}
		//sb[sb.length] = '>&#160;';
		sb[sb.length] = '><div class="ygtvspacer"/>';
		sb[sb.length] = '</td>';

		// add link for swapping current item with next
		sb[sb.length] = '<td';
		if (this.nextSibling != undefined) {
			sb[sb.length] = ' id="ygtvd' + this.index + '"';
			sb[sb.length] = ' class="' + 'ygtvmvdown"';
			sb[sb.length] = ' onmouseover="this.className=\'ygtvmvdownh\'"';
			//sb[sb.length] = getNode + '.getHoverStyle()+\'_mvdown\'"';
			sb[sb.length] = ' onmouseout="this.className=\'ygtvmvdown\'"';
			//sb[sb.length] = getNode + '.getStyle()+\'_mvdown\'"';
			sb[sb.length] = ' onclick="return ' + getNode + '.onDownClick(' + getNode +')"';
		}
		else {
			sb[sb.length] = ' class="' + 'ygtvmvdownn"';
		}
		//sb[sb.length] = '>&#160;';
		sb[sb.length] = '><div class="ygtvspacer"/>';
		sb[sb.length] = '</td>';

		// add link for removing item, unless it is root
		sb[sb.length] = '<td';
		if (this.depth > 0) {
			sb[sb.length] = ' id="ygtvr' + this.index + '"';
			sb[sb.length] = ' class="' + 'ygtvmvdel"';
			sb[sb.length] = ' onmouseover="this.className=\'ygtvmvdelh\'"';
			//sb[sb.length] = getNode + '.getHoverStyle()+\'_mvdown\'"';
			sb[sb.length] = ' onmouseout="this.className=\'ygtvmvdel\'"';
			//sb[sb.length] = getNode + '.getStyle()+\'_mvdown\'"';
			sb[sb.length] = ' onclick="return ' + getNode + '.onDelClick(' + getNode +')"';
		}
		else {
			sb[sb.length] = ' class="' + 'ygtvmvdeln"';
		}
		//sb[sb.length] = '>&#160;';
		sb[sb.length] = '><div class="ygtvspacer"/>';
		sb[sb.length] = '</td>';

		// add link for editing the item.
		// If root, no type change permitted;
		// root and recursive, no val change permitted either...
		sb[sb.length] = '<td';
		if (this.depth == 0 && (this.data.kindOf() == 'struct' || this.data.kindOf() == 'array') && !allowTopLevelElementTypeChange) {
			sb[sb.length] = ' class="' + 'ygtvmveditn"';
		}
		else {
			sb[sb.length] = ' id="ygtve' + this.index + '"';
			sb[sb.length] = ' class="' + 'ygtvmvedit"';
			sb[sb.length] = ' onmouseover="this.className=\'ygtvmvedith\'"';
			//sb[sb.length] = getNode + '.getHoverStyle()+\'_mvdown\'"';
			sb[sb.length] = ' onmouseout="this.className=\'ygtvmvedit\'"';
			//sb[sb.length] = getNode + '.getStyle()+\'_mvdown\'"';
			if (this.depth > 0 || this.data.kindOf() == 'undef') {
				sb[sb.length] = ' onclick="return ' + getNode + '.onEditClick(' + getNode +')"';
			}
			else {
				sb[sb.length] = ' onclick="return ' + getNode + '.onEditClick(' + getNode +', allowTopLevelElementTypeChange)"';
			}
		}
		//sb[sb.length] = '>&#160;';
		sb[sb.length] = '><div class="ygtvspacer"/>';
		sb[sb.length] = '</td>';

		// add link for adding an item (below this one), if a struct/array
		sb[sb.length] = '<td';
		if (/*this.depth > 0 ||*/ this.data.kindOf() == 'struct' || this.data.kindOf() == 'array') {
			sb[sb.length] = ' id="ygtva' + this.index + '"';
			sb[sb.length] = ' class="' + 'ygtvmvadd"';
			sb[sb.length] = ' onmouseover="this.className=\'ygtvmvaddh\'"';
			//sb[sb.length] = getNode + '.getHoverStyle()+\'_mvdown\'"';
			sb[sb.length] = ' onmouseout="this.className=\'ygtvmvadd\'"';
			//sb[sb.length] = getNode + '.getStyle()+\'_mvdown\'"';
			sb[sb.length] = ' onclick="return ' + getNode + '.onAddClick(' + getNode +')"';
		}
		else {
			sb[sb.length] = ' class="' + 'ygtvmvaddn"';
		}
		//sb[sb.length] = '>&#160;';
		sb[sb.length] = '><div class="ygtvspacer"/>';
		sb[sb.length] = '</td>';

		}

		// last but not least: the content...
		sb[sb.length] = '<td';
		sb[sb.length] = (this.nowrap) ? ' nowrap="nowrap" ' : '';
		sb[sb.length] = '>';

		// add indicator for name of data...
		if (this.html !== false) {
			sb[sb.length] = '<span';
			sb[sb.length] = ' id="' + this.nameElId + '"';
			sb[sb.length] = ' class="' + this.labelStyle + 'n"';
			sb[sb.length] = ' >"'+xmlrpc_encode_entities(this.html)+'":</span>';
		}

		// add data value, unless array or struct
		if (this.data.kindOf() != 'array' && this.data.kindOf() != 'struct') {
			sb[sb.length] = '<span';
			sb[sb.length] = ' id="' + this.labelElId + '"';
			// if this value has been built out of a NULL/UNDEF js value, but with a correct type,
			// display it using a different class, so that user is alerted of it
			if ((this.data.scalarTyp() != 'null' && this.data.scalarTyp().slice(0, 5) != 'undef') &&
				(this.data.me === null)) {
				sb[sb.length] = ' class="' + this.labelStyle + 'u"';
			}
			else {
				sb[sb.length] = ' class="' + this.labelStyle + '"';
			}
			sb[sb.length] = ' >'+xmlrpc_encode_entities(this.data.scalarVal())+'</span>';
		}

		// add indicator of type of data
		/*sb[sb.length] = ' <a href="#"';
		sb[sb.length] = ' id="' + this.typeElId + '"';
		sb[sb.length] = ' onclick="return ' + getNode + '.onTypeClick(' + getNode +')"';
		sb[sb.length] = ' >['+this.data.scalartyp()+']</a>';*/
		sb[sb.length] = ' <span';
		sb[sb.length] = ' id="' + this.typeElId + '"';
		if (this.data.scalarTyp().slice(0, 5) == 'undef')
			sb[sb.length] = ' class="' + this.labelStyle + 'tu"';
		else
			sb[sb.length] = ' class="' + this.labelStyle + 't"';
		if (this.data.kindOf() == 'array') {
			sb[sb.length] = ' >['+this.data.scalarTyp()+' ('+this.data.arraySize()+')]</span>';
		}
		else if (this.data.kindOf() == 'struct') {
			sb[sb.length] = ' >['+this.data.scalarTyp()+' ('+this.data.structSize()+')]</span>';
		}
		else {
			sb[sb.length] = ' >['+this.data.scalarTyp()+']</span>';
		}
		sb[sb.length] = '</td>';
		sb[sb.length] = '</tr>';
		sb[sb.length] = '</table>';

		return sb.join("");
	},

	/**
	 * Executed when the label is clicked.  Fires the labelClick custom event.
	 * @method onLabelClick
	 * @param me {Node} this node
	 * @scope the anchor tag clicked
	 * @return false to cancel the anchor click
	 */
	onLabelClick: function(me) {
		return me.tree.fireEvent("labelClick", me);
	},

	onDelClick: function(me) {
		//return me.tree.fireEvent("labelClick", me);
		editingElement = this; // use me instead???
		if (this.data.kindOf() == 'array' || this.data.kindOf() == 'struct') {
			var tit = 'Do you really want to delete this value (and all its children)?';
		}
		else {
			var tit = 'Do you really want to delete this value?';
		}
		if (askDeleteConfirmation) {
			deleteConfirmDlg = new YAHOO.widget.SimpleDialog(editElementDiv, {
				width: "300px",
				//fixedcenter: true,
				visible: false,
				modal: true,
				draggable: true,
				//close: true,
				text: tit,
				//icon: YAHOO.widget.SimpleDialog.ICON_HELP,
				constraintoviewport: true,
				buttons: [ { text:"Yes", handler:deleteElementYes, isDefault:true },
						   { text:"No",  handler:deleteElementNo } ]
			} );
			var kl = new YAHOO.util.KeyListener(document, { keys:27 },
				{ fn:deleteConfirmDlg.hide,
					scope:deleteConfirmDlg,
					correctScope:true }, "keyup" );
					// keyup is used here because Safari won't recognize the ESC
					// keydown event, which would normally be used by default
			deleteConfirmDlg.cfg.queueProperty("keylisteners", kl);
			deleteConfirmDlg.render();
			deleteConfirmDlg.show();
		}
		else
			deleteElementYes();
		return false;
	},

	onUpClick: function(me) {
		if(swapChild(this.data, this.parent.data, -1))
			this.reloadTree();
		return false;
	},

	onDownClick: function(me) {
		if(swapChild(this.data, this.parent.data, +1))
			this.reloadTree();
		return false;
	},

	onAddClick: function(me) {
		//return me.tree.fireEvent("labelClick", me);
		editingElement = this; // use me instead???
		if (this.data.kindOf() == 'struct') {
			showEditDlg('', null, true, true); // syntax to create a named val, starting with empty
		}
		else {
			showEditDlg(false, null, true); // syntax to create an anon val
		}
		return false;
	},

	onEditClick: function(me, allowTypeChange) {
		//return me.tree.fireEvent("labelClick", me);
		editingElement = this;
		showEditDlg(this.html, this.data, allowTypeChange);
		return false;
	},

	toString: function() {
		//return "XMLRPCNode (" + this.index + ") " + this.label;
		var out = "XMLRPCNode (" + this.index + ") (" + this.children.length + ") [ ";
		for (var i = 0; i < this.children.length; ++i)
		  out = out + this.children[i].toString() + ',';
		return out + ' ]';
	},

	/**
	* toggle editability of a node (and all children)
	*/
	toggleEditable: function() {
		for (var i = 0; i < this.children.length; ++i)
			this.children[i].toggleEditable();
		this.editable = !(this.editable);
	},

	reloadTree: function() {
		var tree = this.tree;
		var root = tree.getRoot();
		var rootdata = root.children[0].data;
		var newNode = new YAHOO.widget.XMLRPCNode(rootdata, root, true, null, true);
		tree.removeNode(root.children[0]);
		tree.draw();
	}
});


/**
 *
 * @access public
 * @return void
 **/
function initTooltips() {
	upToolTip = new YAHOO.widget.Tooltip("utt", { text: 'Move this node up one position', context: moveUpButtons } );
	downToolTip = new YAHOO.widget.Tooltip("dtt", { text: 'Move this node down one position', context: moveDownButtons } );
	addToolTip = new YAHOO.widget.Tooltip("att", { text: 'Add a child node', context: addButtons } );
	removeToolTip = new YAHOO.widget.Tooltip("rtt", { text: 'Remove this node', context: removeButtons } );
	editToolTip = new YAHOO.widget.Tooltip("ett", { text: 'Edit this node\'s value, type or name', context: editButtons } );
}

/**
 * Show a dialog to add a new value/edit an existing one
 * @param string name
 * @param xmlrpcval value - when NULL, a dialog for adding a new value will be shown
 * @param boolean allowTypeChange (defaults to true)
 * @param boolean allowNameChange (defaults to false)
 * @param function handlerFunc an handler function invoked when user presses OK
 * @return void
 * @access public
 **/
function showEditDlg(name, value, allowTypeChange, allowNameChange, handlerFunc) {

	if (allowTypeChange == undefined)
		allowTypeChange = true;
	if (allowNameChange == undefined)
		allowNameChange = false;
	if (value == undefined || value == null) {
		// adding a value
		if (elementType == 'jsonrpcval') {
			var tit = 'new JSONRPC Value';
		}
		else  {
			var tit = 'new XMLRPC Value';
		}
		var val = '<input id="elVal" type="textbox" name="elementvalue" />';
		var hnd = addElementOk;
		var valtyp = 1;
	}
	else {
		// modifying an existing value
		if (elementType == 'jsonrpcval') {
			var tit = 'edit JSONRPC Value';
		}
		else {
			var tit = 'edit XMLRPC Value';
		}

		// for struct, array elements we block direct editing of value, since the value is made up by their children
		switch (value.scalarTyp())
		{
			case 'undef':
				var val = '<input id="elVal" type="textbox" name="elementvalue" value="" />';
				break;
			case 'array':
			case 'struct':
			case 'null':
				var val = '<input id="elVal" type="textbox" name="elementvalue" value="" disabled="disabled" />';
				break;
			default:
				var val = '<input id="elVal" type="textbox" name="elementvalue" value="'+xmlrpc_encode_entities(value.scalarVal())+'" />';
				break;
		}
		var hnd = editElementOk;
		var valtyp = value.mytype;
	}

	if (handlerFunc !== undefined) {
		// user has specified a callback function to handle positive exit
		hnd = function () {
			var newnam = document.getElementById('elNam').value;
			var newtyp = document.getElementById('elTyp').value;
			var newval = document.getElementById('elVal').value;
			if (this.hide != undefined)
				this.hide();
			handlerFunc(newnam, newtyp, newval);
		}
	}

	// if element has no name, it's not a struct child -> no name can be added
	if (name !== false || allowNameChange) {
		var nam = '<input id="elNam" type="textbox" name="elementname" value="'+xmlrpc_encode_entities(name)+'" />';
	}
	else {
		var nam = '<input id="elNam" type="textbox" name="elementname" disabled="disabled" />';
	}

	if (allowTypeChange) {
		var typch = '';
	}
	else {
		var typch = 'disabled="disabled"';
	}

	var dlgbody = '<div class="hd">'+tit+'</div>'+
'<div class="bd">'+
'	<form id="elEditDlg" method="POST" action="#">'+
'		<label for="elementname" accesskey="N">Name:</label>'+nam+
'			<div class="clear"></div>'+
'		<label for="elementvalue" accesskey="V">Value:</label>'+val+
'			<div class="clear"></div>'+
'		<label for="elementtype" accesskey="T">Type:</label>'+
'		<select id="elTyp" name="elementtype" onchange="editElementTypeChange(\'elTyp\', \'elVal\');"'+typch+'>';
	if (elementType == 'jsonrpcval') {
		var knownValueTypes = '123569'; // valid types for json
	}
	else {
		var knownValueTypes = '12345678'; // valid types for xmlrpc
	}
	if (knownValueTypes.indexOf('1') >= 0) {
		dlgbody = dlgbody +'			<option value="1">String</option>';
	}
	if (knownValueTypes.indexOf('4') >= 0) {
		dlgbody = dlgbody +'			<option value="4">Int</option>';
	}
	if (knownValueTypes.indexOf('5') >= 0) {
		dlgbody = dlgbody +'			<option value="5">Double</option>';
	}
	if (knownValueTypes.indexOf('6') >= 0) {
		dlgbody = dlgbody +'			<option value="6">Boolean</option>';
	}
	if (knownValueTypes.indexOf('7') >= 0) {
		dlgbody = dlgbody +'			<option value="7">Datetime</option>';
	}
	if (knownValueTypes.indexOf('8') >= 0) {
		dlgbody = dlgbody +'			<option value="8">Base64</option>';
	}
	if (knownValueTypes.indexOf('9') >= 0) {
		dlgbody = dlgbody +'			<option value="9">Null</option>';
	}
	if (knownValueTypes.indexOf('2') >= 0) {
		dlgbody = dlgbody +'			<option value="2">Array</option>';
	}
	if (knownValueTypes.indexOf('3') >= 0) {
		dlgbody = dlgbody +'			<option value="3">Struct</option>';
	}

		dlgbody = dlgbody + '		</select>'+
'	</form>'+
'</div>';

		document.getElementById(editElementDiv).innerHTML = dlgbody;
		// real quick + dirty: set correct data type to select box
		document.getElementById('elTyp').value = valtyp;

		// this dialog has to be created only after div has been loaded in doc. body...
		editDlg = new YAHOO.widget.Dialog(editElementDiv, {
			width : "300px",
			//fixedcenter : true,
			visible : false,
			modal: true,
			draggable: true,
			constraintoviewport : true,
			buttons : [ { text:"OK", handler:hnd, isDefault:true },
						{ text:"Cancel", handler:editElementCancel } ]
		} );
		var kl1 = new YAHOO.util.KeyListener(document, { keys:27 },
			{ fn:editDlg.hide, scope:editDlg, correctScope:true }, "keyup" );
				// keyup is used here because Safari won't recognize the ESC
				// keydown event, which would normally be used by default
		var kl2 = new YAHOO.util.KeyListener(document, { keys:13 },
			{ fn:hnd, scope:editDlg, correctScope:true }, "keydown" );
				//scope:editDlg,
				//correctScope:true
		editDlg.cfg.queueProperty("keylisteners", [kl1, kl2]);
		editDlg.render();
		editDlg.show();
}

/**
 * Confirmation dialog event handler
 * @access private
 * @return void
 **/
function deleteElementYes() {
	// we might have been called by a dialog - or not...
	if (this.hide != undefined)
		this.hide();
	if (!removeChild(editingElement.data, editingElement.parent.data)) {
		alert('Uncanny error while removing node');
	}
	else
	{
		//var parent = editingElement.parent;
		//parent.removeChild(editingElement);
		//parent.tree.draw();

		// reinit the tree. This will sync changes from the data model.
		// Strangely enough, calling removeChildren() on root will notdo the
		// trick...
		editingElement.reloadTree();
	}
}

/**
 * Confirmation dialog event handler for deletion of a tree Node
 * @access private
 * @return void
 **/
function deleteElementNo() {
	this.hide();
}

/**
 * Confirmation dialog event handler for editing of a tree node xmlrpc value
 * @access private
 * @return void
 **/
function editElementOk() {
	// check if xmlrpcval element changed a wee bit or not
	var newnam = document.getElementById('elNam').value;
	var newtyp = document.getElementById('elTyp').value;
	var newval = document.getElementById('elVal').value;

	var nam = editingElement.html;
	var typ = editingElement.data.mytype;
	var val = editingElement.data.me;

	if (preventAnonStructEelements) {
		if (newnam == '' && editingElement.depth > 0 && editingElement.parent.data.kindOf() == 'struct') {
			alert('Sorry, a name is needed for struct elements');
			return;
		}
	}

	if (newnam != nam || typ != newtyp || ((typeof(val) != 'object' || val === null) && newval !== val )) {

		// if only name changed, do not destroy existing object or its children
		if (typ == newtyp && ((typeof(val) == 'object' && val !== null) || newval === val)) {
			var newobj = editingElement.data;
		}
		else {
			var newobj = buildVal(newtyp, newval);
		}

		if (editingElement.depth == 0) {
			// the elemnt being edited is a tree root
			editingElement.data = newobj;
			editingElement.reloadTree();
		}
		else {
			// we are inside a struct / array here, since we are not root
			if (editingElement.parent.data.kindOf() == 'array') {
				var idx = editingElement.parent.data.me.indexOf(editingElement.data);
				editingElement.parent.data.me[idx] = newobj;
				editingElement.reloadTree();
			}
			else if (editingElement.parent.data.kindOf() == 'struct') {
				// check if name of element changed, or only its value/type
				if (newnam != nam) {
					var tempobj = {};
					for (var attr in editingElement.parent.data.me) {
						if (attr != nam) {
							tempobj[attr] = editingElement.parent.data.me[attr];
						}
						else {
							tempobj[newnam] = newobj;
						}
					}
					editingElement.parent.data.me = tempobj;
				}
				else {
					editingElement.parent.data.me[nam] = newobj
				}
				editingElement.reloadTree();
			}
			else {
				// cannot get here
				alert('Uncanny error while editing node');
			}
		}
	}
	if (this.hide != undefined)
		this.hide();
}

/**
 * Confirmation dialog event handler for adding a tree node xmlrpc value
 * @access private
 * @return void
 **/
function addElementOk() {
	var newnam = document.getElementById('elNam').value;
	var newtyp = document.getElementById('elTyp').value;
	var newval = document.getElementById('elVal').value;

	if (preventAnonStructEelements) {
		if (newnam == '' && editingElement.data.kindOf() == 'struct') {
			alert('Sorry, a name is needed for struct elements');
			return;
		}
	}

	var newobj = buildVal(newtyp, newval);

	if (editingElement.data.kindOf() == 'struct') {
		/// @todo alert user if struct key with this name exists...
		var anonobj = {}
		anonobj[newnam] = newobj;
		editingElement.data.addStruct(anonobj);
		editingElement.reloadTree();
	}
	else if (editingElement.data.kindOf() == 'array') {
		editingElement.data.addArray([newobj]);
		editingElement.reloadTree();
	}
	else {
		// cannot get here
		alert('Uncanny error while adding node');
	}

	if (this.hide != undefined)
		this.hide();
}

/**
 * Confirmation dialog event handler for editing of a tree node xmlrpc value
 * @access private
 * @return void
 **/
function editElementCancel() {
	//alert('said Cancel');
	this.hide();
}

/**
 * event handler for change of a tree node xmlrpc value type
 * @access public
 * @return void
 **/
function editElementTypeChange(typeInputId, valInputId) {
	typ = document.getElementById(typeInputId).value;
	if (typ == 2 || typ == 3 || typ == 9) {
		document.getElementById(valInputId).value = '';
		document.getElementById(valInputId).disabled = true;
	}
	else {
		document.getElementById(valInputId).disabled = false;
	}
}

/* functions that operate on xmlrpcval objects */

/**
 * Build a new xmlrpcval object, doing a lilttle type validation
 * @access public
 * @return xmlrpcval
 **/
function buildVal(newtyp, newval) {
	// dirty direct access to xmlrpcval internals: bleargh!
	if (elementType == 'jsonrpcval') {
		var newobj = new jsonrpcval();
	}
	else {
		var newobj = new xmlrpcval();
	}
	newobj.mytype = Number(newtyp);
	if (newtyp == 3) {
		newobj.me = {};
	}
	else if (newtyp == 2) {
		newobj.me = [];
	}
	else {
		if (newtyp == 4) {
			newval = isNaN(parseInt(newval)) ? 0 : parseInt(newval);
		}
		else if (newtyp == 5) {
			newval = isNaN(parseFloat(newval)) ? 0 : parseFloat(newval);
		}
		else if (newtyp == 6) {
			/// @todo trim content before converting it?
			if (newval == '0' || newval == '' || newval.toLowerCase() == 'false' ) {
				newval = false;
			}
			else
				newval = true;
		}
		else if (newtyp == 7) {
			// we accept dates using a lot of separator chars...
			if (/^(\d{4})[\/\\ -._]?(\d{2})[\/\\ -._]?(\d{2})[T ]?(\d{2})[:.]?(\d{2})[:.]?(\d{2})/.test(newval)) {
				newval = RegExp.$1+RegExp.$2+RegExp.$3+'T'+RegExp.$4+':'+RegExp.$5+':'+RegExp.$6;
			}
			else {
				newval = iso8601_encode(new Date());
			}
		}
		else if (newtyp == 8) {
			// base64 values: everythingis accepted here, since encoding
			// is carried out on serialization
		}
		else if (newtyp == 9) {
			newval = null;
		}
		newobj.me = newval;
	}
	return newobj;
}

/**
 * Remove a child node from an xmlrpcval
 * @access public
 * @return void
 **/
function removeChild(aNode, aParent)
{
	var found = false;
	if (aParent.kindOf() == 'array') {
		/// @todo check if we can use splice() for faster ops
		newArr = [];
		for (var i = 0; i < aParent.arraySize(); i++)
			if (aParent.arrayMem(i) != aNode) {
				newArr[newArr.length] = aParent.arrayMem(i);
			}
			else
			{
				found = true;
			}
		aParent.me = newArr;
		return found;
	}
	else if (aParent.kindOf() == 'struct') {
		newObj = {};
		for (var attr in aParent.me)
			if (aParent.structMem(attr) != aNode) {
				newObj[attr] = aParent.structMem(attr);
			}
			else
			{
				found = true;
			}
		aParent.me = newObj;
		return found;
	} else
		return false;
}

/**
 * Swaps position of two child nodes in an xmlrpcval
 * @access public
 * @return void
 **/
function swapChild(aNode, aParent, anOffset){
	if (aParent.kindOf() == 'array') {
		for (var i=0; i < aParent.arraySize(); ++i) {
			if (aNode === aParent.arrayMem(i)) {
				var next = i+anOffset;
				if (next < 0 || next >= aParent.arraySize()) {
					return false;
				}
				aParent.me[i] = aParent.me[next];
				aParent.me[next] = aNode;
				return true;
			}
		}
	} else if (aParent.kindOf() == 'struct') {
		// very borings stuff: reordering objects in js...
		var keys = [];
		var vals = [];
		var i = 0;
		var found = -1;
		for (var attr in aParent.me) {
			keys[i] = attr;
			vals[i] = aParent.me[attr];
			if (aNode === aParent.me[attr]) {
				found = i;
			}
			++i;
		}
		if (found >= 0) {
			var next = found+anOffset;
			if (next < 0 || next >= i) {
				return false;
			}
			var tmp = keys[found];
			keys[found] = keys[next];
			keys[next] = tmp;
			tmp = vals[found];
			vals[found] = vals[next];
			vals[next] = tmp;
			var out = {};
			for (var j = 0; j < i; j++) {
			  out[keys[j]] = vals[j];
			}
			aParent.me = out;
			return true;
		}
	} else
		return false;
}


/* for those poor browsers that have a lacking JS implementation, we provide JS 1.5 compat.... */
if(typeof Array.prototype.indexOf==='undefined')Array.prototype.indexOf=function(n){for(var i=0;i<this.length;i++){if(this[i]===n){return i;}}return -1;}