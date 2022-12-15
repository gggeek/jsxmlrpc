/**
 * Example script to take advantage of jsxmlrpc in a WSH script host environment
 * ex: Cscript.exe demo_wsh.js
 *
 * @author Gaetano Giunta
 *
 * @todo this is currently broken. We need to transpile the library to ES5 for it to work...
 */

function include(jsFile) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var f = fso.OpenTextFile(jsFile);
    var s = f.ReadAll();
    f.Close();
    return s;
}

// Import jsxmlrpc lib - do a poor man's transpilation on the fly
var source = include('..\\lib\\xmlrpc_lib.js');
// strip ES6 features
source = source.replace(/^export /mg, '');
source = source.replace(/ polyfills [\s\S]+ global variables/, '');
/// @todo other features we need to fix: usage of default function arguments, possibly get/set
eval(source);

var client = new xmlrpc_client('https://gggeek.altervista.org/sw/xmlrpc/demo/server/server.php');
var msg = new xmlrpcmsg('system.listMethods', []);
client.setDebug(2);
var resp = client.send(msg);
