const { series } = require('gulp');
//const fs = require('fs');

function clean(cb) {
    /// @todo
    cb();
}

function doc(cb) {
    // @todo
    // ./docs/build/setup_tools.sh
    // jsdoc ...
    // rewrite the links in the xsl files
    // ./node_modules/.bin/xslt3 -s:doc/build/xmlrpc_js.xml -xsl:doc/build/custom.xsl -o:doc/xmlrpc_js.html
    // ./node_modules/.bin/xslt3 -s:doc/build/xmlrpc_js.xml -xsl:doc/build/custom.fo.xsl -o:doc/build/xmlrpc_js.fo.xml
    // fop doc/build/xmlrpc_js.fo.xml doc/xmlrpc_js.pdf
    cb();
}

exports.doc = doc;
exports.default = series(clean, doc);
