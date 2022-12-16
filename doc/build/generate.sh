#!/bin/bash

set -e

cd "$(dirname -- "$(dirname -- "$(dirname -- "${BASH_SOURCE[0]}")")")"

# API docs from JS
./node_modules/.bin/jsdoc -R ./README.md -d doc/api lib/

# Manual in html and pdf formats, from docbook source
sed -r -i -e 's|%docbook-chunk.xsl%|./docbook-xsl/xhtml/chunk.xsl|g' doc/build/custom.xsl
sed -r -i -e 's|%fo-docbook.xsl%|./docbook-xsl/fo/docbook.xsl|g' doc/build/custom.fo.xsl
./node_modules/.bin/xslt3 -s:doc/build/xmlrpc_js.xml -xsl:doc/build/custom.xsl -o:doc/xmlrpc_js.html
./node_modules/.bin/xslt3 -s:doc/build/xmlrpc_js.xml -xsl:doc/build/custom.fo.xsl -o:doc/build/xmlrpc_js.fo.xml
fop doc/build/xmlrpc_js.fo.xml doc/xmlrpc_js.pdf

rm doc/build/xmlrpc_js.fo.xml
