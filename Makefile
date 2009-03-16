# Makefile for jsxmlrpc library
# $Id: Makefile,v 1.7 2008/03/07 16:52:53 ggiunta Exp $

### USER EDITABLE VARS ###

# path to PHP executable, preferably CLI version
PHP=/usr/local/bin/php

# path were jsxmlrpc lib files will be copied to
JSINCLUDEDIR=/usr/local/apache2/htdocs

# mkdir is a thorny beast under windows: make sure we can not use the cmd version, running eg. "make MKDIR=mkdir.exe"
MKDIR=mkdir


#### DO NOT TOUCH FROM HERE ONWARDS ###

# recover version number from code
# thanks to Firman Pribadi for unix command line help
export VERSION=$(shell egrep "var *xmlrpcVersion *= *'" xmlrpc_lib.js | sed -r s/"(.*= *' *)([0-9a-zA-Z.-]+)(.*)"/\\2/g )

LIBFILES=xmlrpc_lib.js jsonrpc_lib.js xmlrpc_wrappers.js

#EXTRAFILES=test.pl \
# test.py \
# rsakey.pem \
# workspace.testPhpServer.fttb

#DEMOFILES=vardemo.php \
# demo1.txt \
# demo2.txt \
# demo3.txt

#DEMOSFILES=discuss.php \
# server.php \
# proxy.php

#DEMOCFILES=agesort.php \
# client.php \
# comment.php \
# introspect.php \
# mail.php \
# simple_call.php \
# which.php \
# wrap.php \
# zopetest.php

#TESTFILES=testsuite.php \
# benchmark.php \
# parse_args.php \
# phpunit.php \
# verify_compat.php \
# PHPUnit/*.php

INFOFILES=Changelog.txt \
 Makefile \
 NEWS \
 README

DEBUGGERFILES=debugger.html \
 visualeditor.html \
 visualeditor.css \
 xmlrpc_display.js \
 xmlrpc_tree.css \
 container.css \
 logger.css \
 tree.css \
 yui/*.js \
 img/*.gif*
 

all: install

install:
	cd lib && cp ${LIBFILES} ${JSINCLUDEDIR}
	@echo Lib files have been copied to ${JSINCLUDEDIR}
	cd doc && $(MAKE) install

test:
#	cd test && ${PHP} -q testsuite.php


### the following targets are to be used for library development ###

dist: jsxmlrpc-${VERSION}.tar.gz jsxmlrpc-${VERSION}.zip

jsxmlrpc-${VERSION}.tar.gz jsxmlrpc-${VERSION}.zip: ${LIBFILES} ${DEBUGGERFILES} ${INFOFILES}
	@echo ---${VERSION}---
	rm -rf jsxmlrpc-${VERSION}
	${MKDIR} jsxmlrpc-${VERSION}
	${MKDIR} jsxmlrpc-${VERSION}/lib
	cp --parents ${LIBFILES} jsxmlrpc-${VERSION}/lib
	${PHP} minify.php ${LIBFILES} > jsxmlrpc-${VERSION}/lib/jsxmlrpc-min.js
	${MKDIR} jsxmlrpc-${VERSION}/debugger
	${MKDIR} jsxmlrpc-${VERSION}/debugger/img
	${MKDIR} jsxmlrpc-${VERSION}/debugger/yui
	cp --parents ${DEBUGGERFILES} jsxmlrpc-${VERSION}/debugger
	cp ${INFOFILES} jsxmlrpc-${VERSION}
	cd doc && $(MAKE) dist
	find jsxmlrpc-${VERSION} -type f ! -name "*.gif" ! -name "*.pdf" -exec dos2unix {} \;
	-rm jsxmlrpc-${VERSION}.tar.gz jsxmlrpc-${VERSION}.zip
	tar -cvf jsxmlrpc-${VERSION}.tar jsxmlrpc-${VERSION}
	gzip jsxmlrpc-${VERSION}.tar
	zip -r jsxmlrpc-${VERSION}.zip jsxmlrpc-${VERSION}

doc:
	cd doc && $(MAKE) doc

clean:
	rm -rf jsxmlrpc-${VERSION}
	cd doc && $(MAKE) clean
