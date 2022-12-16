#!/bin/bash

set -e

cd "$(dirname -- "$(dirname -- "${BASH_SOURCE[0]}")")"

# We minify the original files, so that index.js and the debugger do not need to use different includes when run as part
# of an npm package or a github tarball
for FILE in $(ls lib/*_*.js)
do
    mv "${FILE}" "${FILE}.max"
    ./node_modules/.bin/uglifyjs --compress --module --ie --v8 --webkit -o "${FILE}" --source-map "url='./${FILE}.map'" -- "${FILE}.max"
    rm "${FILE}.max"
done


for FILE in $(ls debugger/yui/*.js)
do
    mv "${FILE}" "${FILE}.max"
    ./node_modules/.bin/uglifyjs --compress --module --ie --v8 --webkit -o "${FILE}" -- "${FILE}.max"
    rm "${FILE}.max"
done

# @todo minify the debugger css files
