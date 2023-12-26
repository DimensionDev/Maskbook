# Implementation status

Methods listed in this document is not a commitment that it will be implemented.
The list is built from what [MetaMask supported](https://docs.metamask.io/wallet/reference/json-rpc-api/).

- <https://ethereum.github.io/execution-apis/api-documentation/>

- [ ] Do params check before sending them to the background.

## Need revisit

## Read ETH methods

- [x] eth_accounts
- [x] eth_blockNumber
- [x] eth_call
- [x] eth_chainId
- [x] eth_estimateGas
- [x] eth_feeHistory
- [x] eth_gasPrice
- [x] eth_getBalance
- [x] eth_getBlockByHash
- [x] eth_getBlockByNumber
- [x] eth_getBlockReceipts
- [x] eth_getBlockTransactionCountByHash
- [x] eth_getBlockTransactionCountByNumber
- [x] eth_getCode
- [x] eth_getLogs
- [x] eth_getProof
- [x] eth_getStorageAt
- [x] eth_getTransactionByBlockHashAndIndex
- [x] eth_getTransactionByBlockNumberAndIndex
- [x] eth_getTransactionByHash
- [x] eth_getTransactionCount
- [x] eth_getTransactionReceipt
- [x] eth_getUncleCountByBlockHash
- [x] eth_getUncleCountByBlockNumber
- [x] eth_syncing

## Write ETH methods

- [ ] eth_sign (EIP-191): <https://support.metamask.io/hc/en-us/articles/14764161421467-What-is-eth-sign-and-why-is-it-a-risk->
- [x] personal_sign
- [x] eth_sendTransaction
- [ ] ~~eth_signTransaction: MetaMask refuse to add, we should follow them. <https://github.com/MetaMask/metamask-extension/issues/3475>~~
- [x] eth_sendRawTransaction

## ETH methods

## Subscribe to events (unknown specification)

- [ ] eth_subscribe
- [ ] eth_unsubscribe

## Filters

- [ ] eth_getFilterChanges
- [ ] eth_getFilterLogs
- [ ] eth_newBlockFilter
- [ ] eth_newFilter
- [ ] eth_newPendingTransactionFilter
- [ ] eth_uninstallFilter

## Deprecated methods

- [ ] eth_decrypt
- [ ] eth_getEncryptionPublicKey

## [EIP-1102: Opt-in account exposure](https://eips.ethereum.org/EIPS/eip-1102)

- [x] eth_requestAccounts
- [ ] (Deprecated) Provider.enable()

## [EIP-2255: Wallet Permissions System](https://eips.ethereum.org/EIPS/eip-2255)

- [x] wallet_getPermissions
- [x] wallet_requestPermissions
- [ ] wallet_revokePermissions

## [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)

- [ ] eth_signTypedData or eth_signTypedData_v4?

## Other EIP

- [ ] wallet_watchAsset <https://eips.ethereum.org/EIPS/eip-747>
- [ ] wallet_addEthereumChain <https://eips.ethereum.org/EIPS/eip-3085>
- [ ] wallet_switchEthereumChain <https://ethereum-magicians.org/t/eip-3326-wallet-switchethereumchain>

## Methods that has no specification?

Methods not on a standard track is unlikely to be implemented.

- [ ] web3_clientVersion <https://docs.metamask.io/wallet/reference/web3_clientversion/>

## Other question

- [ ] eth_coinbase (not supported by infura)
- [ ] eth_maxPriorityFeePerGas: does not exist / is not available (MetaMask) but in their docs <https://docs.metamask.io/wallet/reference/eth_maxpriorityfeepergas/>
- [ ] eth_createAccessList: in ETH RPC specification but not in MetaMask.
