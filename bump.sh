#!/bin/bash
# Đổi version cả 2 file cùng lúc.  Dùng:  ./bump.sh 1.5.0
[ -z "$1" ] && { echo "Thiếu số version.  Ví dụ: ./bump.sh 1.5.0"; exit 1; }
sed -i "s/const APP_VERSION = \"[^\"]*\"/const APP_VERSION = \"$1\"/" index.html
sed -i "s/const VERSION = \"[^\"]*\"/const VERSION = \"$1\"/" sw.js
echo "Đã đổi sang v$1:"
grep -m1 "APP_VERSION" index.html
grep -m1 "^const VERSION" sw.js
