# Implementation status

Methods listed in this document is not a commitment that it will be implemented.
The list is built from what [MetaMask supported](https://docs.metamask.io/wallet/reference/json-rpc-api/).

- <https://ethereum.github.io/execution-apis/api-documentation/> or <https://eips.ethereum.org/EIPS/eip-1474>

## Readonly ETH methods

- [x] eth_accounts
- eth_blobBaseFee: not supported by infura
- [x] eth_blockNumber
- [x] eth_call
- [x] eth_chainId
- eth_coinbase: not supported by infura
- eth_createAccessList: not in MetaMask
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
- [x] eth_maxPriorityFeePerGas
- [x] eth_syncing

### Filters

- [x] eth_getFilterChanges
- [x] eth_getFilterLogs
- [x] eth_newBlockFilter
- [x] eth_newFilter
- eth_newPendingTransactionFilter (not supported by infura)
- [x] eth_uninstallFilter

### [EIP-1474: Remote procedure call specification](https://eips.ethereum.org/EIPS/eip-1474)

This section excludes PoW era methods and methods listed in <https://ethereum.github.io/execution-apis/api-documentation/>.

- eth_protocolVersion: not in MetaMask
- net_listening: not in MetaMask
- net_peerCount: not in MetaMask
- [x] net_version
- web3_clientVersion: not in MetaMask
- web3_sha3: not in MetaMask

### [EIP-758: Subscriptions and filters for completed transactions](https://eips.ethereum.org/EIPS/eip-758)

- [x] eth_subscribe
- [x] eth_unsubscribe

## Wallet managements

- [x] wallet_watchAsset ([EIP-747](https://eips.ethereum.org/EIPS/eip-747))
- [ ] wallet_addEthereumChain ([EIP-3085](https://eips.ethereum.org/EIPS/eip-3085))
- [x] wallet_switchEthereumChain ([EIP-3326](https://eips.ethereum.org/EIPS/eip-3326))

### [EIP-1102: Opt-in account exposure](https://eips.ethereum.org/EIPS/eip-1102)

- [x] eth_requestAccounts
- (Deprecated) Provider.enable()

### [EIP-2255: Wallet Permissions System](https://eips.ethereum.org/EIPS/eip-2255)

- [x] wallet_getPermissions
- [x] wallet_requestPermissions
- [ ] wallet_revokePermissions (not in EIP-2255)

## Readwrite ETH methods

- (Deprecated) eth_decrypt (replacement <https://eips.ethereum.org/EIPS/eip-5630>)
- (Deprecated) eth_getEncryptionPublicKey (replacement <https://eips.ethereum.org/EIPS/eip-5630>)
- eth_sign (EIP-191): <https://support.metamask.io/hc/en-us/articles/14764161421467-What-is-eth-sign-and-why-is-it-a-risk->
- [x] eth_sendTransaction
- [x] eth_sendRawTransaction
- eth_signTransaction: <https://github.com/MetaMask/metamask-extension/issues/3475>
- [x] personal_ecRecover (unknown EIP)
- [x] personal_sign (EIP-191)

### [EIP-712: Typed structured data hashing and signing](https://eips.ethereum.org/EIPS/eip-712)

- (Deprecated) eth_signTypedData
- (Deprecated) eth_signTypedData_v3
- [x] eth_signTypedData_v4
