<!-- markdownlint-disable no-duplicate-heading -->

# Mask Flavored JSON RPC API

## Transaction

### `mask_watchTransaction`

Periodically retrieve the transaction receipt and cache the result in the background.

> Note: The [`eth_getTransactionReceipt`](https://eth.wiki/json-rpc/API#eth_gettransactionreceipt) will read receipt from the cache instead of the RPC provider. If you really need the instant receipt you should use `mask_getTransactionReceipt`.

#### Parameters

- `string` the hash of transaction
- `config` the transaction config object. Learn more: [`eth_sendTransaction`](https://eth.wiki/json-rpc/API#eth_sendtransaction).

#### Returns

- `void`

### `mask_unwatchTransaction`

Stop watching a transaction. It means invoke [`eth_getTransactionReceipt`](https://eth.wiki/json-rpc/API#eth_gettransactionreceipt) with the given hash will always return `null`.

#### Parameters

- `string` the hash of transaction

#### Returns

- `void`

### `mask_getTransactionReceipt`

The non-hijacked version of [`eth_getTransactionReceipt`](https://eth.wiki/json-rpc/API#eth_gettransactionreceipt).

### `mask_replaceTransaction`

Replace a transaction with the given one.

#### Parameters

- `string` the hash of the transaction to be replaced
- `config` the transaction config object. Learn more: [`eth_sendTransaction`](https://eth.wiki/json-rpc/API#eth_sendtransaction).

#### Returns

- `void`

### `mask_cancelTransaction`

Cancel the given transaction.

#### Parameters

- `string` the hash of the transaction to be canceled
- `config` the transaction config object. Learn more: [`eth_sendTransaction`](https://eth.wiki/json-rpc/API#eth_sendtransaction).

#### Returns

- `void`

### `mask_confirmTransaction`

Confirm to send a risk transaction.

#### Parameters

- `void`

#### Returns

- `void`

### `mask_rejectTransaction`

Reject to send a risk transaction.

#### Parameters

- `void`

#### Returns

- `void`

## Wallet

### `mask_requestAccounts`

Connect to any wallet on the back of Mask Network.

#### Parameters

- `number` or `void` the chain id of the expected chain
- `string` or `void` the network id of the expected chain (`NetworkPluginID`)

#### Returns

- `void`

### `mask_dismissAccounts`

Disconnect with the connected wallet.

#### Parameters

- `void`

#### Returns

- `void`
