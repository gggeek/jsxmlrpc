#!/bin/bash

set -e

cd "$(dirname -- "$(dirname -- "$(dirname -- "${BASH_SOURCE[0]}")")")"

# API docs from JS
./node_modules/.bin/jsdoc -R ./README.md -d doc/api lib/

# "Manual" in html and pdf formats, from docbook source

# Abandoned toolchain: xslt + fop
#sed -r -i -e 's|%docbook-chunk.xsl%|./docbook-xsl/xhtml/chunk.xsl|g' doc/build/custom.xsl
#sed -r -i -e 's|%fo-docbook.xsl%|./docbook-xsl/fo/docbook.xsl|g' doc/build/custom.fo.xsl
## This fails because the docbook xslt files contain DTD entities, which are not supported by the Node xml parser.
##./node_modules/.bin/xslt3 -s:doc/build/xmlrpc_js.xml -xsl:doc/build/custom.xsl -o:doc/xmlrpc_js.html
##./node_modules/.bin/xslt3 -s:doc/build/xmlrpc_js.xml -xsl:doc/build/custom.fo.xsl -o:doc/build/xmlrpc_js.fo.xml
## So we moved to xsltproc :-)
#xsltproc -o doc/manual/ ./doc/build/custom.xsl doc/xmlrpc_js.xml
#xsltproc -o doc/build/xmlrpc_js.fo.xml ./doc/build/custom.fo.xsl doc/xmlrpc_js.xml
#fop doc/build/xmlrpc_js.fo.xml doc/xmlrpc_js.pdf
#rm doc/build/xmlrpc_js.fo.xml

# This toolchain works
pandoc -s --from=docbook --to=html -o doc/xmlrpc_js.html doc/xmlrpc_js.xml
pandoc -s --from=docbook --to=pdf -o doc/xmlrpc_js.pdf doc/xmlrpc_js.xml
