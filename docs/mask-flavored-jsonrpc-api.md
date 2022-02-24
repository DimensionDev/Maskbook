<!-- markdownlint-disable no-duplicate-heading -->

# Mask Flavored JSON RPC API

## mask_watchTransaction

Periodically retrieve the transaction receipt and cache the result in the background.

> Note: The [`eth_getTransactionReceipt`](https://eth.wiki/json-rpc/API#eth_gettransactionreceipt) will read receipt from the cache instead of the RPC provider. If you really need the instant receipt you should use `mask_getTransactionReceipt`.

### Parameters

- `string` the hash of transaction
- `config` the transaction config object. Learn more: [`eth_sendTransaction`](https://eth.wiki/json-rpc/API#eth_sendtransaction).

### Returns

- `void`

## mask_unwatchTransaction

Stop watching a transaction. It means invoke [`eth_getTransactionReceipt`](https://eth.wiki/json-rpc/API#eth_gettransactionreceipt) with the given hash will always return `null`.

### Parameters

- `string` the hash of transaction

### Returns

- `void`

## mask_getTransactionReceipt

The non-hijacked version of [`eth_getTransactionReceipt`](https://eth.wiki/json-rpc/API#eth_gettransactionreceipt).

## mask_replaceTransaction

Replace a transaction with the given one.

### Parameters

- `string` the hash of the transaction to be replaced
- `config` the transaction config object. Learn more: [`eth_sendTransaction`](https://eth.wiki/json-rpc/API#eth_sendtransaction).

### Returns

- `void`

## mask_cancelTransaction

Cancel the given transaction.

### Parameters

- `string` the hash of the transaction to be canceled
- `config` the transaction config object. Learn more: [`eth_sendTransaction`](https://eth.wiki/json-rpc/API#eth_sendtransaction).

### Returns

- `void`

## mask_confirmTransaction

Confirm to send a risk transaction.

### Parameters

- `void`

### Returns

- `void`

## mask_rejectTransaction

Reject to send a risk transaction.

### Parameters

- `void`

### Returns

- `void`

## mask_loginFortmatic

Pull up the fortmatic login dialog.

### Parameters

- `void`

### Returns

- `void`

## mask_logoutFortmatic

Disconnect with the fortmatic wallet.

### Parameters

- `void`

### Returns

- `void`
