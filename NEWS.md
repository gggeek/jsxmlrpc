## JS-XMLRPC version 0.6.0 - 2022/12/17

* BREAKING CHANGE: transformed the library in an ES6 module, available as NPM package "@jsxmlrpc/jsxmlrpc".

  This means that:
  - the minimum supported browser versions have increased notably
  - NodeJS is now supported
  - WSH is not supported anymore
  - in order to make use of the library in a browser, the js code including it has to use an `import` statement, rather
    than simply include it via a `script` tag
  - the library is now made available via a CDN, making it easy to use it in frontend code without adding it to your webserver

* fixed: setting the user-agent http header in requests
* fixed: defaulting to port 443 when creating a client from an https url with no port specified
* fixed: hardened methods used to generate js code to wrap remote servers against code injection
* improvement: make use of `JSON.parse` for parsing jsonrpc responses
* improvement: debugger: removed or disabled all unsupported options
* improvement: added extra details in some error messages


## JS-XMLRPC version 0.5 - 2022/11/29

* debugger improvements: fix loading the js library files
* debugger improvements: in case the dialog for visually editing values does fail submitting values, show an alert
* debugger improvements: fix previewing of manually built xmlrpc params


## JS-XMLRPC version 0.4 - 2009/09/05

A lot of bugs have been fixed since version 0.3, in many areas of encoding and decoding xmlrpc values.

* added method setUserCredentials to xmlrpc_client, as the 'parent' php lib does in its latest version
* added support for the <ex:nil/> tag from the apache library, both in input and output (output regulated by the
  xmlrpc_null_apache_encoding variable, input by the xmlrpc_null_extension one)
* base64_decode now trims whitespace
* updated bundled yui to version 2.5.0
* fixed a bug in error log handler when using firefox+firebug
* fixed a bug in xmlrpc_decode with structs
* fixed a bug in parsing cookie headers in http responses
* allow lib to work in Windows Scripting Host environments
* added two demo files, for WSH and VB


## JS-XMLRPC version 0.3 - 2007/06/26

A lot of bugs have been fixed since version 0.2, in many areas of encoding and decoding xmlrpc values.

There is better support for Firefox when setting debug mode to clients, and for Safari when the port is not specified in
the server url.
The debug and error logging mechanism has been rewritten, and will take advantage of Firebug when detected.
The function wrap_xmlrpc_server (from the original PHP api) has been implemented, and a couple of bugs fixed in
wrap_xmlrpc_method

All users are advised to upgrade.


## JS-XMLRPC version 0.2 - 2007/04/25

I'm pleased to announce the second release of the js-xmlrpc library.

The big improvements are:
- support for async client requests (with an optional user-specified timeout)
- support for proxying remote methods into native javascript functions
- API documentation is now included in the distribution
- minifed (compact) version of the lib is now included in the distribution

Although there are no known bugs, a complete testsuite has not yet been developed to insure formal correctness. Please
consider the code beta quality, and report any bugs you find to https://github.com/gggeek/jsxmlrpc


## JS-XMLRPC version 0.1 - 2007/02/25

I'm pleased to announce the initial release of the js-xmlrpc library.

The documentation is quite scarce (read: nonexistent), but the code is in pretty good shape.

The library has been designed with the goal of being 100% compatible with the api of the PHP-XMLRPC library,
language-specifics aside. You should be able to read the documentation of php-xmlrpc and easily translate the examples in
javascript code. The docs can be found at: http://phpxmlrpc.sourceforge.net/doc-2/

There are quite a few missing features in this initial release of the library,
the most notable ones being:
- support for async client requests (makes building interactive interfaces hard)
- support for user specified timeout in client requests
- support for transparent decoding of php objects / javascript objects

A (100% javascript) webservice debugger is included in the distribution. It should
be limited to send calls to the same webserver that is hosting it, so it is most
useful when deployed on the same webserver providing the target webservices.
