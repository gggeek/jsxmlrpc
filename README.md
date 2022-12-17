JS-XMLRPC
=========

DESCRIPTION
-----------

A javascript library for building xmlrpc and jsonrpc clients.

REQUIREMENTS
------------

* Any browser with support for ECMAScript 6 including XMLHttpRequest and DOMParser (*) or
* NodeJS version v12.20.0 or v14.13.0 or later

(*) = according to caniuse.com, that includes at least: Chrome 61, Edge 16, Firefox 60, Opera 48, Safari 11, Chrome
    Android 108, Firefox for Android 107, Opera Mobile 72, Safari on iOS 11, Samsung Internet 8.2

INSTALLATION
------------

### Browsers

include the following in the web page, within a `<script type="module>` section:

    import {xmlrpc_client, xmlrpcmsg, xmlrpcval} from 'https://cdn.jsdelivr.net/npm/@jsxmlrpc/jsxmlrpc@0.6/dist/lib/index.js';

### NodeJS

Run

    npm install @jsxmlrpc/jsxmlrpc

Then, in your code, add:

    import {xmlrpc_client, xmlrpcmsg, xmlrpcval} from '@jsxmlrpc/jsxmlrpc';

USAGE / API DOCUMENTATION
-------------------------

HTML documentation can be found in the doc/ directory. The manual ([xmlrpc_js.xml](doc/xmlrpc_js.xml)) is "xml file
with stylesheets" format: it can be viewed perfectly with a web browser.

A couple of sample files can be found in the demo/ directory.

DEBUGGER USAGE
--------------

Start a webserver for static assets which has its document root at the root of this package, eg:

    npx http-server

or

    php -S localhost:8081

Then point your browser at `/debugger/debugger.html`, eg:

    http://localhost:8081/debugger/debugger.html

__NB__ since the debugger runs in the browser, it is not allowed by default to make http requests to 3rd party servers
(servers on a different domain than the debugger). In order for 3rd party servers to accept requests coming from the
debugger, they have to be set up to accept CORS pre-flight requests.

COPYRIGHT
---------

Use of this software is subject to the terms in [LICENSE](LICENSE).

AUTHORS
-------

Gaetano Giunta
