#!/usr/bin/env bash

# TODO:
# solc is not listed in the deps of project
# replace it with solcjs
declare -a contracts=("happy-red-packet" "bulk-checkout" "splitter")

for i in "${contracts[@]}"
do
    for f in ./contracts/$i/*.sol
    do         
        # compole contracts
        solc $f --abi --overwrite -o ./contracts/$i/ --allow-paths $(pwd)/node_modules/
    done

    for f in ./contracts/$i/*.abi
    do 
        # generate typings
        npx typechain $f --target=web3-v1 --outDir ./src/plugins/Wallet/contracts/$i

        # copy abi to source folder
        cp $f ./src/plugins/Wallet/contracts/$i/"$(echo "${f##*/}" | sed s/abi/json/)"

        # rm duplicate type.d.ts
        mv ./src/plugins/Wallet/contracts/$i/types.d.ts ./src/plugins/Wallet/contracts/
    done
done

# format code
npx prettier ./src/plugins/Wallet/contracts/* --write
