<!DOCTYPE html>
<html lang="en">
<head>
<title>XMLRPC Debugger Visual Editor</title>
<?php
/**
 * Dialog for visually editing trees of json/xmlrpc values
 * @author Gaetano Giunta
 * @copyright (c) 2006-2022 G. Giunta
 * @license code licensed under the BSD License: see LICENSE file
 *
 * @todo try harder to use pure-js for this
 * @todo do not set to "null" new nodes
 * @todo add http no-cache headers. Is it really necessary? After all, a single http roundtrip is used...
 * @todo find a better way to preview large trees of values (at least make all panel draggable)
 * @todo improve display: do not show up/down arrows, 'angle line' for parameters, move up list numbers in ff
 */

// parse GET parameters and html-cleanse them

// semicolon-separated list of types for the starting parameters
// (hint: the number of shown parameters depends on this)
if (isset($_GET['params']) && $_GET['params'] != '')
{
    $params = split(';', $_GET['params']);
}
else
{
  $params = array();
}

// choose between json and xmlrpc
if (isset($_GET['type']) && $_GET['type'] == 'jsonrpc')
{
    $type = 'jsonrpc';
    // list of scalar types we accept as valid (struct, arrays are always ok)
    $valid_types = array('string', 'null', 'double', 'boolean');
    // be kind when receiving a param specced as int: treat it as double
    foreach($params as $key => $val)
    {
        if (preg_match('/^(i4|int)$/i', $val))
        {
            $params[$key] = 'double';
        }
    }
}
else
{
    $type = 'xmlrpc';
    $valid_types = array('string', 'i4', 'int', 'double', 'boolean', 'base64', 'datetime.iso8601');
}

// when set to true/1, adding new vals or modifying type of initial values is forbidden
$noadd = (isset($_GET['noadd'])) ? (bool)$_GET['noadd'] : false;

?>

<!-- YUI Treeview component: base libs -->
<script type="text/javascript" src="yui/yahoo.js" ></script>
<script type="text/javascript" src="yui/event.js" ></script>
<!-- YUI Treeview component: treeview -->
<script type="text/javascript" src="yui/treeview.js" ></script>
<link rel="stylesheet" type="text/css" href="tree.css" />
<!-- YUI Dialog component -->
<script type="text/javascript" src="yui/dom.js" ></script>
<script type="text/javascript" src="yui/dragdrop.js" ></script>
<script type="text/javascript" src="yui/container.js" ></script>
<link rel="stylesheet" type="text/css" href="container.css" />

<!-- display components -->
<script type="text/javascript" src="xmlrpc_display.js"></script>
<link rel="stylesheet" type="text/css" href="xmlrpc_tree.css" />

<!-- xmlrpc/jsonrpc base library -->
<script type="module">
    import {base64_encode, htmlentities, xmlrpcval, xmlrpc_encode_entities} from "../lib/xmlrpc_lib.js";
    import {jsonrpcval} from "../lib/jsonrpc_lib.js";

    window.base64_encode = base64_encode;
    window.jsonrpcval = jsonrpcval;
    window.xmlrpcval = xmlrpcval;
    window.xmlrpc_encode_entities = xmlrpc_encode_entities;
</script>

<script type="text/javascript">
// set up xmlrpc lib display options
askDeleteConfirmation = true;
editElementDiv = 'dlgpanel';
<?php if (!$noadd) echo "allowTopLevelElementTypeChange = true;\n"; ?>
elementType = '<?php echo $type; ?>val';

var trees = [];
var nodes = [];
var previewDlg = null;

window.treeInit = function()
{
    trees = [];
    nodes = [];

<?php
    $divs = '';
    $trees = '';
    foreach($params as $i => $ptype)
    {
        $ptype = strtolower($ptype);
        $trees .= "    trees[$i] = new YAHOO.widget.TreeView('param$i');\n";
        if ($ptype == 'struct')
            $trees .= "    nodes[$i] = new YAHOO.widget.XMLRPCNode(new {$type}val({}, '$ptype'), trees[$i].getRoot(), true, null, true);\n";
        else if ($ptype == 'array')
            $trees .= "    nodes[$i] = new YAHOO.widget.XMLRPCNode(new {$type}val([], '$ptype'), trees[$i].getRoot(), true, null, true);\n";
        else if (in_array($ptype, $valid_types))
        {
            if ($ptype == 'datetime.iso8601') // we need a mixed-case type specifier for dates
                $trees .= "    nodes[$i] = new YAHOO.widget.XMLRPCNode(new {$type}val(null, 'dateTime.iso8601'), trees[$i].getRoot(), true, null, true);\n";
            else
                $trees .= "    nodes[$i] = new YAHOO.widget.XMLRPCNode(new {$type}val(null, '$ptype'), trees[$i].getRoot(), true, null, true);\n";
        }
        else
            $trees .= "    nodes[$i] = new YAHOO.widget.XMLRPCNode(new {$type}val(), trees[$i].getRoot(), true, null, true);\n";
        $trees .= "    trees[$i].draw()\n";
        //echo "<h3>Parameter $i: $ptype</h3>\n";
        $divs .= "<li id=\"param{$i}\" class=\"paramdiv\"></li>\\n";
    }
    echo "    document.getElementById(\"valuepanel\").innerHTML = '$divs';\n";
    echo $trees;
    echo "    document.getElementById('numparams').innerHTML = '".count($params)."';\n";
?>

}

window.addParam = function()
{
    showEditDlg(false, null, true, false, function(name, type, value) {

        // add a div for the tree to the document
        // add a tree
        var next = trees.length;
        var newTree = document.createElement("li");
        newTree.className = 'paramdiv';
        document.getElementById('valuepanel').appendChild(newTree);
        trees[next] = new YAHOO.widget.TreeView(newTree);
        nodes[next] = new YAHOO.widget.XMLRPCNode(buildVal(type, value), trees[next].getRoot(), true, null, true);
        trees[next].draw();
        document.getElementById('numparams').innerHTML = (next+1);

    });
}

function buildthem()
{
    var out = '';
    var root;
    for (var i = 0; i < trees.length; i++)
    {
        root = trees[i].getRoot().children[0];
        root.toggleEditable();
        trees[i].draw();
<?php
    if ($type == 'jsonrpc')
    {
        /// @todo use an array and implode() here? it would be cleaner...
        echo "            out += root.data.serialize()+',\\n';\n";
        echo "    }\n";
        echo "    out = out.slice(0, -2)+'\\n';\n";
    }
    else
    {
        echo "        out += '<param>\\n'+root.data.serialize()+'</param>\\n';\n";
        echo "    }\n";
    }
?>
    return out;
}

function hidePreviewDlg()
{
    var root;
    for (var i = 0; i < trees.length; i++)
    {
        root = trees[i].getRoot().children[0];
        root.toggleEditable();
        trees[i].draw();
    }
    this.hide();
}

window.preview = function()
{
    if (nodes.length == 0)
        alert('No parameters to be serialized');
    else
    {
        document.getElementById(editElementDiv).innerHTML = '<div class="hd">Serialized parameters</div>'+
            '<div class="bd"><pre>' + htmlentities(buildthem()) + '</pre></div>';
        previewDlg = new YAHOO.widget.Dialog(editElementDiv, {
            width : "400px",
            x: 240,
            y: 75,
            fixedcenter : false,
            visible : true,
            modal: true,
            draggable: true,
            constraintoviewport : false,
            buttons : [ { text:"OK", handler:hidePreviewDlg, isDefault:true } ]
            //                        { text:"Cancel", handler:editElementCancel } ]
        });
        var kl1 = new YAHOO.util.KeyListener(document, { keys:27 },
            { fn:hidePreviewDlg, scope:previewDlg, correctScope:true }, "keyup");
            // keyup is used here because Safari won't recognize the ESC
            // keydown event, which would normally be used by default
        previewDlg.cfg.queueProperty("keylisteners", [kl1]);
        previewDlg.render();
        previewDlg.show();
    }
}

window.done = function()
{
    var out = base64_encode(buildthem());
    try {
        if (window.opener && window.opener.buildparams)
            window.opener.buildparams(out);
    } catch (error) {
        alert('Error submitting parameters back: ' + error);
    }
    window.close();
}
</script>

<link rel="stylesheet" type="text/css" href="visualeditor.css" />

</head>
<body onload="treeInit();">
<h2>Editing <span id="numparams"></span>&nbsp;<?php echo $type; ?> parameters</h2>
<h3>
<?php if (!$noadd) echo '<a href="#" onclick="addParam(); return false;">Add parameter</a> | '; ?>
<a href="#" onclick="treeInit(); return false;">Reset all</a> |
<a href="#" onclick="preview(); return false;">Preview</a> |
<a href="#" onclick="window.close();">Cancel</a> |
<a href="#" onclick="done(); return false;">Submit</a>
</h3>
<noscript>
WARNING: this page is completely useless without javascript support.<br />Please use a javascript-enabled browser
</noscript>
<div id="dlgpanel"></div>
<ol id="valuepanel"></ol>
</body>
</html>
