#!/bin/bash

# Has to be run as a sudoer

set -e

# @todo install a more recent pandoc version straight from github, and use pagedjs-cli as pdf engine for it? texlive is huge...

cd "$(dirname -- "${BASH_SOURCE[0]}")"

sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl git pandoc texlive unzip
#    curl git fop unzip xsltproc

# Download and unzip the dockbook xslt package
# Commented out, since we now use pandoc, which has no built-in xslt support
#DOCBOOK_XSL_VERSION="1.79.2"
#if [ ! -d docbook-xsl ]; then
#    # @todo what if dbxsl.zip exists?
#    curl -fsSL "https://github.com/docbook/xslt10-stylesheets/releases/download/release/${DOCBOOK_XSL_VERSION}/docbook-xsl-${DOCBOOK_XSL_VERSION}.zip" --output dbxsl.zip
#    unzip dbxsl.zip
#    mv "docbook-xsl-${DOCBOOK_XSL_VERSION}" docbook-xsl
#    rm dbxsl.zip
#fi
