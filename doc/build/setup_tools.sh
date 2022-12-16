#!/bin/bash

# Has to be run as a sudoer

set -e

DOCBOOK_XSL_VERSION=1.79.2

cd "$(dirname -- "${BASH_SOURCE[0]}")"

sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl fop unzip

# download and unzip the xslt package
if [ ! -d docbook-xsl ]; then
    curl -fsSL "https://github.com/docbook/xslt10-stylesheets/releases/download/release/${DOCBOOK_XSL_VERSION}/docbook-xsl-${DOCBOOK_XSL_VERSION}.zip" --output dbxsl.zip
    unzip dbxsl.zip
    mv "docbook-xsl-${DOCBOOK_XSL_VERSION}" docbook-xsl
    rm dbxsl.zip
fi
