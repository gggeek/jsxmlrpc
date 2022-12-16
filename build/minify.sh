#!/bin/bash

set -e

cd "$(dirname -- "$(dirname -- "${BASH_SOURCE[0]}")")"

# Get the current commit
COMMIT=$(git rev-parse HEAD)
ROOT="https://raw.githubusercontent.com/gggeek/jsxmlrpc/$COMMIT/lib"

# We minify the original files, so that index.js and the debugger do not need to use different includes when run as part
# of an npm package or a github tarball
cd lib
for FILE in $(ls *_*.js)
do
    # @todo do not (re)compress the files if they contain a '//# sourceMappingURL'
    mv "${FILE}" "${FILE}.mjs"
    ../node_modules/.bin/uglifyjs --compress --module --ie --v8 --webkit -o "${FILE}" --source-map "url='${FILE}.map',filename='${FILE}',root='${ROOT}'" -- "${FILE}.mjs"
    sed -r -i -e 's/\.js\.mjs"/.js"/g' "${FILE}.map"
    rm "${FILE}.mjs"
done
cd ..

for FILE in $(ls debugger/yui/*.js)
do
    mv "${FILE}" "${FILE}.mjs"
    ./node_modules/.bin/uglifyjs --compress --module --ie --v8 --webkit -o "${FILE}" -- "${FILE}.mjs"
    rm "${FILE}.mjs"
done

# @todo minify the debugger css files
