#!/usr/bin/env bash

# TODO:
# solc is not listed in the deps of project
# replace it with solcjs

# self hosted contracts

declare -a contract_names=("happy-red-packet" "bulk-checkout" "splitter" "balance-checker" "pair" "uniswap-v2-router" "multicall")
declare -a contract_hosted=(true true true false false false false)
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

# fix the type of PromiEvent
# before: import PromiEvent from 'web/promiEvent'
# after: import PromiEvent from 'promievent'
sed -i '' "s/web3\/promiEvent/promievent/" ./src/contracts/types.d.ts

# fix the type of send()
# before: send(tx?: Tx): PromiEvent<T>
# after: send(tx?: Tx, callback?: (error: Error, hash: string) => void): PromiEvent<TransactionReceipt>
sed -i '' "s/import { EventLog }/import { EventLog, TransactionReceipt }/" ./src/contracts/types.d.ts
sed -i '' "s/send(options?: EstimateGasOptions): PromiEvent<T>/send(options?: EstimateGasOptions, callback: (error: Error | null, hash: string) => void): PromiEvent<TransactionReceipt>/" ./src/contracts/types.d.ts
sed -i '' "s/send(tx?: Tx): PromiEvent<T>/send(tx?: Tx, callback?: (error: Error | null, hash: string) => void): PromiEvent<TransactionReceipt>/" ./src/contracts/types.d.ts

# format code
npx prettier ./src/contracts/* --write