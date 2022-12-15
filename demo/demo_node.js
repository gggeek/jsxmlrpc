import {xmlrpc_client, xmlrpcmsg} from '@jsxmlrpc/jsxmlrpc';

let client = new xmlrpc_client('https://gggeek.altervista.org/sw/xmlrpc/demo/server/server.php');
let msg = new xmlrpcmsg('system.listMethods', []);
client.setDebug(2);
// only async calls are supported by xhr2
client.send(msg, 0, function(resp) {
    console.log('FAULT CODE: ' + resp.faultCode());
    console.log('FAULT STRING: ' +  resp.faultString());
    console.log('VALUE: ' +  resp.value().arrayMem(0).scalarVal());
});
