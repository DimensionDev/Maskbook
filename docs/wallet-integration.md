# Wallet Integration

Any wallet available in a browser environment can integrate into Mask Network. Well know wallets like [MetaMask](https://metamask.io/), [WalletConnect](https://docs.walletconnect.com/) and [Fortmatic](https://fortmatic.com/) have already been integrated. Besides that, Mask Network is also able to host accounts by itself.

## Overview

```txt
   Front End Page                                 Background Page
+------------------+                            +-----------------+
|       User       | - Messaging API ---------- |  RPC Composer   |
+------------------+                            +-----------------+
                                                |                 |
+------------------+                   +-----------------+   +-----------------+
| Bridge Component | - Event Emitter-- |  Other Wallets  |   |   Mask Wallet   |
+------------------+                   +-----------------+   +-----------------+
         |                                                            |
+------------------+                                                  |
|    Wallet SDK    |                                                  |
+------------------+                                                  |
         |                                                            |
         +------------------------- Network --------------------------+
```

Above is an architecture overview illustrating how Mask Network integrates multiple wallets simultaneously. Roughly speaking, it includes two parts: the bridge component on the front end, and the JSON-RPC composer on the background end. They communicate with each other by leveraging the [Messaging Passing API](https://developer.chrome.com/docs/extensions/mv3/messaging/).

As a quick example to let you know how all stuff spins. Here is a UI button that will emit an `eth_getBlockNumber` request once it is clicked.

```tsx
import { useWeb3 } from '@masknet/web3-shared-evm'

function Example() {
  const web3 = useWeb3()
  const onClick = useCallback(async () => {
    const blockNumber = await web3.eth.getBlockNumber()
    console.log(`The current block number is ${blockNumber}.`)
  }, [web3])
  return <button onClick={onClick}>Get Block Number</button>
}
```

First of all, it creates a [Web3](https://web3js.readthedocs.io/) instance which redirects all JSON-RPC requests to the [request](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/extension/background-script/EthereumServices/request.ts) service on the background page. If you'd like to read the source code, you will realise that there is a [Koa.js](https://koajs.com/) styled [composer](https://github.com/koajs/compose) built-in. A list of middleware is used and serve different purposes: a middleware stores transactions into DB, a middleware watches transaction status, a middleware notifies transaction progress, and so on.

At the current stage, there are two kinds of wallets: Mask Wallet and other wallets.

Mask Wallet sends requests to the network directly on the background page. If the request takes the response, then the user will get notified.

But it's not that simple for other wallets. They are supported only on the front end. E.g., the [Fortmatic](https://docs.fortmatic.com/) SDK injects an iframe on the currently visiting page. Mask Network cannot invoke those SDKs on the background page as an extension. Because of that, they should take their requests to the front end and handle them there. Many mounted components, so-called `ProviderBridge`, listen to the `PROVIDER_RPC_REQUEST` event and call the corresponding SDK once they receive any request from the background. After the SKD finishes the work, they return the result to the bridged provider on the background page with the `PROVIDER_RPC_RESPONSE` event.

It takes a quite long detour, but the benefit is all requests can leverage Mask Wallet abilities.

## A Wallet on a bridged provider

If the wallet that only works on the front end. It needs to use the bridged provider way.

On the front end:

- create a bridged provider by implementing the [`EIP1193Provider`](https://github.com/DimensionDev/Maskbook/blob/develop/packages/web3-shared/evm/types/index.ts) interface.
- instantiate the bridged provider in [useBridgedProvider](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/plugins/EVM/hooks/useBridgedProvider.ts) which was used by [`<ProviderBridge />`](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/plugins/EVM/UI/components/ProviderBridge.tsx).
- add a new `<ProviderBridge />` in the [EVM](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/plugins/EVM/UI/SNSAdaptor/index.tsx) plugin to receive events from the background page.

On the background page:

- instantiate a [BridgedProvider](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/extension/background-script/EthereumServices/providers/Bridged.ts) and add it into the supported list in [getProvider](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/extension/background-script/EthereumServices/provider.ts).

## A wallet without any UI

If the wallet is totally UI free and can connect/disconnect by calling some APIs. It can send requests to those APIs directly.

On the background page:

- create a provider to extend from the [BaseProvider](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/extension/background-script/EthereumServices/providers/MaskWallet.ts) interface and add it into the supported list in [getProvider](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/extension/background-script/EthereumServices/provider.ts).

## Interceptor

The implementation of Ethereum JSON-RPC may very different between wallets. Those JSON-RPC requests will need some preprocessing before sending to the real wallet. Nevertheless, the Mask Network flavors a bunch of self-known RPC methods that were unknown to other wallets. Bypassing a such request will hit an unimplemented error.

<!-- spell-checker: disable-next-line -->

For this sake, the [`composer`](https://github.com/DimensionDev/Maskbook/blob/develop/packages/mask/src/extension/background-script/EthereumServices/composer.ts) creates a middleware for intercepting JSON-RPC requests. Here is a quick example that converts the Mask Network flavored [`mask_requestAccounts`](./mask-flavored-**jsonrpc**-api.md#mask_requestaccounts) into an Ethereum styled [`eth_accounts`](https://eth.wiki/json-rpc/API#eth_accounts).

```ts
export class Example implements Middleware<Context> {
  async fn(context: Context, next: () => Promise<void>) {
    switch (context.method) {
      case EthereumMethodType.MASK_REQUEST_ACCOUNTS:
        context.requestArguments = {
          ...context.requestArguments,
          method: EthereumMethodType.ETH_ACCOUNTS,
        }
        break
      default:
        break
    }
    await next()
  }
}
```

## Examples

| Wallet        | Implementation |
| ------------- | -------------- |
| MetaMask      | \-             |
| WalletConnect | \-             |
| Fortmatic     | \-             |
