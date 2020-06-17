#!/usr/bin/env bash

# TODO:
# solc is not listed in the deps of project
# replace it with solcjs
declare -a contracts=("happy-red-packet" "bulk-checkout")

for i in "${contracts[@]}"
do
    # compole contracts...
    solc ./contracts/$i/*.sol --abi --overwrite -o ./contracts/$i/ --allow-paths $(pwd)/node_modules/

    # generate typings...
    npx typechain $(./contracts/$i/*.abi) --target=web3-v1 --outDir ./src/plugins/Wallet/contracts/$i

    # copy abi to source folder...
    for f in $(./contracts/$i/*.abi)
    do
        cp "$f" ./src/plugins/Wallet/contracts/$i/"$(echo "${f##*/}" | sed s/abi/json/)";
    done;
done
