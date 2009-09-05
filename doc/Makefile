# $Id: Makefile,v 1.8 2008/03/07 17:09:56 ggiunta Exp $

### USER EDITABLE VARS ###

WEB=/var/www/jsxmlrpc/doc

MKDIR=mkdir

PHP=php

FOP=fop

JSDOC=jsdoc.pl

#### DO NOT TOUCH FROM HERE ONWARDS ###

install:
	${MKDIR} -p ${WEB}
	cp *.html ${WEB}
	cp *.css ${WEB}
	#cp *.pdf ${WEB}
	@echo HTML version of the manual has been installed to ${WEB}


### the following targets are to be used for library development ###

doc: out/index.html jsxmlrpc.pdf js_docs_out/index.html

out/index.html jsxmlrpc.pdf: xmlrpc_js.xml 
	-${MKDIR} out
	-rm -rf out/*
# custom php script that does the xslt magic
	${PHP} convert.php xmlrpc_js.xml custom.xsl out/
# fix link to api in html docs
#	sed -e 's/href=\"???\"/href=\"api\/index.html\"/' out/ch07.html > out/ch07b.html && cp -f out/ch07b.html out/ch07.html && rm out/ch07b.html
	
# convert to fo and then to pdf using apache fop
	${PHP} convert.php xmlrpc_js.xml custom.fo.xsl xmlrpc_js.fo.xml
	${FOP} xmlrpc_js.fo.xml jsxmlrpc.pdf
#-rm xmlrpc_js.fo.xml

js_docs_out/index.html: ../lib/xmlrpc_lib.js ../lib/jsonrpc_lib.js
	-${MKDIR} js_docs_out
	-rm -rf js_docs_out/*
# command for jsdoc javadoc parser for javascript
	${JSDOC} --project-name=js-xmlrpc ../lib/xmlrpc_lib.js ../lib/jsonrpc_lib.js ../lib/xmlrpc_wrappers.js

dist: doc
	${MKDIR} -p ../jsxmlrpc-${VERSION}/doc
	-cp out/*.html ../jsxmlrpc-${VERSION}/doc
	-cp out/*.css ../jsxmlrpc-${VERSION}/doc
	cp xmlrpc_js.xml ../jsxmlrpc-${VERSION}/doc
	-cp jsxmlrpc.pdf ../jsxmlrpc-${VERSION}/doc
	cp Makefile ../jsxmlrpc-${VERSION}/doc
# jsdocs
	${MKDIR} -p ../jsxmlrpc-${VERSION}/doc/api
	-cp js_docs_out/*.html ../jsxmlrpc-${VERSION}/doc/api
	-cp js_docs_out/*.css ../jsxmlrpc-${VERSION}/doc/api

clean:
	-rm -f out/*.html
	-rm -f out/*.css
	-rm -f js_docs_out/*.html
	-rm -f js_docs_out/*.css
	-rm xmlrpc_js.fo.xml
	-rm jsxmlrpc.pdf
