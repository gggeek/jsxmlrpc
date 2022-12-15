#!/bin/bash

# Has to be run as a sudoer

set -e

sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
    fop

# @todo download and unzip the xslt package
