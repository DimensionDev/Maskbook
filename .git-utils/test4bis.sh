#!/bin/bash
# This is a test script intended for use with git bisect.
# USAGE (vs the latest release):
#  git bisect start HEAD $(git describe --tags) --
#  git bisect run sh .git-utils/test4bis.sh
#     [OPEN BROWSER, DO MANUAL TESTS, FOLLOW INTERACTIVE SHITE]
#  git bisect reset
function yesno() {
    local res
    while true; do
        read -r -n 1 -p "does it work now? (y/n) " res
        case $res in
            (y|Y)  return 0;;
            (n|N)  return 1;;
            (*)    printf '%s\n' " read the prompt!" >&2
        esac
    done
}

npm run-script build &&
yesno
