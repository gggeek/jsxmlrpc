#!/bin/bash

# Has to be run as a sudoer

set -e

cd "$(dirname -- "${BASH_SOURCE[0]}")"
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
    fop unzip

# @todo download and unzip the xslt package
#curl https://github.com/docbook/xslt10-stylesheets/releases/download/release/1.79.2/docbook-xsl-1.79.2.zip
#unzip docbook-xsl-1.79.2.zip
