// For this to work, use npm to install jsdom and xhr2

import {xmlrpc_client, xmlrpcmsg} from '@jsxmlrpc/jsxmlrpc';

// 'hack' 1 - this is required to insure the XMLHttpRequest object used by the library is available when on Node
import XMLHttpRequest from 'xhr2';
global.XMLHttpRequest = XMLHttpRequest;
// 'hack' 2 - same with an xml parser
import jsdom  from 'jsdom';
const { JSDOM } = jsdom;
global.DOMParser = new JSDOM().window.DOMParser;

let client = new xmlrpc_client('https://gggeek.altervista.org/sw/xmlrpc/demo/server/server.php');
let msg = new xmlrpcmsg('system.listMethods', []);
client.setDebug(2);
// only async calls are supported by xhr2
client.send(msg, 0, function(resp) {
    console.log('FAULT CODE: ' + resp.faultCode());
    console.log('FAULT STRING: ' +  resp.faultString());
    console.log('VALUE: ' +  resp.value());
});
