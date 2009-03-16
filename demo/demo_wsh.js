/**
 * Example script to take advantage of jsxmlrpc in a WSH script host environment
 *
 * @version $Id: demo_wsh.js,v 1.1 2007/07/13 17:33:17 ggiunta Exp $
 * @author Gaetano Giunta
 * @copyright
 */

// Import jsxmlrpc lib
// trick from http://msdn.microsoft.com/msdnmag/issues/1100/cutting/
function Include(jsFile) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var f = fso.OpenTextFile(jsFile);
    var s = f.ReadAll();
    f.Close();
    return s;
}

eval(Include('xmlrpc_lib.js'));

var client = new xmlrpc_client('http://phpxmlrpc.sourceforge.net/server.php');
var msg = new xmlrpcmsg('system.listMethods', []);
client.setDebug(2);
var resp = client.send(msg);