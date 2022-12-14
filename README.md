JS-XMLRPC
=========

DESCRIPTION
-----------

A javascript library for building xmlrpc and jsonrpc clients.

REQUIREMENTS
------------

* Any browser with support for ECMAScript 6 and XMLHttpRequest or
* NodeJS version v12.20.0 or v14.13.0 or later, or
* Windows Scripting Host version (???)

API DOCUMENTATION
-----------------

HTML documentation can be found in the doc/ directory.

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
