#!/usr/bin/env bash

# TODO:
# solc is not listed in the deps of project
# replace it with solcjs
solc ./contracts/*.sol --abi --overwrite -o ./contracts/ --allow-paths "$(pwd)/node_modules/"
solc ./node_modules/openzeppelin-solidity/contracts/token/ERC20/IERC20.sol --abi --overwrite -o ./contracts/ --allow-paths "$(pwd)/node_modules/"
npx typechain "$(./contracts/*.abi)" --target=web3-v1 --outDir ./src/plugins/Wallet/contract/

# copy abi to source folder
for f in ./contracts/*.abi;
    do cp "$f" ./src/plugins/Wallet/contract/"$(echo "${f##*/}" | sed s/abi/json/)";
done;
