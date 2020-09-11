#!/usr/bin/env bash

# TODO:
# solc is not listed in the deps of project
# replace it with solcjs

# self hosted contracts

declare -a contract_names=("happy-red-packet" "bulk-checkout" "splitter" "balance-checker" "uniswap-v2-router")
declare -a contract_hosted=(true true true false false)
declare size=${#contract_names[@]}

for ((i=0; i < $size; i++));
do
    declare contract_name=${contract_names[$i]}

    if [ ${contract_hosted[$i]} == true ]; then
        for f in ./contracts/$contract_name/*.sol
        do
            # compile contracts
            solc $f --abi --overwrite -o ./contracts/$contract_name/ --allow-paths $(pwd)/node_modules/
        done
    fi

    for f in ./contracts/$contract_name/*.abi
    do 
        # generate typings
        npx typechain $f --target=web3-v1 --outDir ./src/contracts/$contract_name

        # copy abi to source folder
        cp $f ./src/contracts/$contract_name/"$(echo "${f##*/}" | sed s/abi/json/)"

        # rm duplicate type.d.ts
        mv ./src/contracts/$contract_name/types.d.ts ./src/contracts/types.d.ts
    done
done

# fix the import path of type.d.ts
sed -i '' "s/.\/types/..\/types/" ./src/contracts/**/*.d.ts

# format code
npx prettier ./src/contracts/* --write