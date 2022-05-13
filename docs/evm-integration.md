# EVM Chain Integration

It's easy to integrate an EVM-compatible chain into Mask Network. After you add a new `ChainId` and `NetworkType` in `packages/web3-shared/evm/types/index.ts`. You can follow the TypeScript compiler. By fixing these errors, the integration progress will keep moving forward. Here is a complete instruction list to ensure you wouldn't miss anything.

## Integration Instructions

### Setup Metadata

- [ ] Add a logo image
  - `packages/mask/src/plugins/EVM/assets/`
- [ ] Add metadata data
  - `packages/web3-shared/evm/assets/chains.json`
- [ ] Add an HTTP RPC node
  - `packages/web3-constants/evm/rpc.json`
- [ ] Set network descriptor
  - `PLUGIN_NETWORKS` in `packages/mask/src/plugins/EVM/constants.ts`

### Setup External APIs

Mask Network fetches on-chain data from various data sources. Therefore, you can configure the identification data of the chain on those providers.

| Provider      | Configuration Path                               |
| ------------- | ------------------------------------------------ |
| DeBank        | `packages/web3-constants/evm/debank.json`        |
| CoinGecko     | `packages/web3-constants/evm/coingecko.json`     |
| CoinMarketCap | `packages/web3-constants/evm/coinmarketcap.json` |
| Zerion        | `packages/web3-constants/evm/zerion.json`        |

#### Learn more

- <https://api.coingecko.com/api/v3/asset_platforms>

### Web3 Constants Compile Config

Add the chain name to `compileConstants()` in `packages/web3-constants/compile-constants.ts`.

### Token List

The team maintains a token list <https://github.com/DimensionDev/Mask-Token-List>. So free feel to create one for the chain. And add the token list link to `packages/web3-constants/evm/token-list.json`.

### Token Icon

The token icon could be read from the token list. Or in case of a network problem from a fallback link. Add the fallback links into `packages/web3-constants/evm/token-asset-base-url.json`.

### DEX

Mask Network has integrated Uniswap V2 and Uniswap V3 into the trader plugin. If the DEX of the chain is a fork from them can be easily configured. Learn more: `packages/web3-constants/evm/trader.json`.

For API-based DEX, please ref to how other DEXes integrated:

| DEX       | Pull Request Link                                    |
| --------- | ---------------------------------------------------- |
| DODO      | <https://github.com/DimensionDev/Maskbook/pull/3882> |
| OpenOcean | <https://github.com/DimensionDev/Maskbook/pull/5198> |

### Deploy Contracts

If there is no one deployed [these contracts](https://github.com/DimensionDev/misc_smart_contract) on the chain. Please contact the team.

- [ ] Multicall Contract
- [ ] BalanceChecker
- [ ] [Mask Box](https://github.com/DimensionDev/MysteryBox/tree/add_more_networks)
- [ ] [Red Packet and NFT Packet](https://github.com/DimensionDev/RedPacket/tree/add_more_networks)
- [ ] [ITO](https://github.com/DimensionDev/InitialTwitterOffering/tree/add_more_networks)

### Translate JSON-RPC

For a chain that follows a different JSON-RPC protocol with the [Ethereum](https://eth.wiki/json-rpc/API), a transactor is used to `encode` and `decode` each request and make the chain just like an EVM-compatible one.

E.g., the CELO chain can pay the transaction fee with non-native tokens. It supports to use [`feeCurrency`](https://docs.celo.org/celo-codebase/protocol/transactions/erc20-transaction-fees) field to set the token address, which doesn't exist in the original [`eth_sendTransaction`](https://eth.wiki/json-rpc/API#eth_sendtransaction) payload. You can fulfill this requirement by a transactor without altering any JSON-RPC facilities.

```ts
class CeloTranslator extends Base {
  override encode(context: Context) {
    context.config = {
      ...context.config,
      feeCurrency: '0x0000000000000000000000000000000000000001', // suppose it's a token address
    }
  }
}
```

### 🎉

Congratulation! You have done the coding part.

## Testing Checklist

Here is the chain abilities checklist. If you are working on a bounty task, please do each task in list before inviting the team to review your pull request.

- [ ] Check if the asset list and transaction history on the dashboard page work when you choose the chain as the network.
  - Setup the chain for DeBank API.
- [ ] Check if the trending view is working. Try to hover a new chain token in any tweets.

  - Setup the chain for Coingecko API.
  - Setup the chain for CoinMarketCap API.

- [ ] Check if the gas estimate dialog is working.

  - Setup the chain for CoinGecko API.

- [ ] Trade with the DEX on the chain.

  - Integrate a DEX for the chain.
  - Estimate gas will be showed on DEX card and sort correctly.

- [ ] Send a transaction and check if the explorer links are working.

  - Setup metadata and RPC for the chain.
  - Transaction sent to wallet with medium gas fee setting.
  - Required to unlock ERC20 token before swapping ERC20 to any other tokens.

- [ ] Transfer token on the transfer page of Dashboard and the wallet tab of the plugin popup.

## Examples

| Chain      | Pull Request Link                                    |
| ---------- | ---------------------------------------------------- |
| CELO       | <https://github.com/DimensionDev/Maskbook/pull/5052> |
| Fantom     | <https://github.com/DimensionDev/Maskbook/pull/5036> |
| xDai       | <https://github.com/DimensionDev/Maskbook/pull/4140> |
| Arbitrum   | <https://github.com/DimensionDev/Maskbook/pull/3558> |
| Avalanche  | <https://github.com/DimensionDev/Maskbook/pull/5289> |
| Harmony    | <https://github.com/DimensionDev/Maskbook/pull/5835> |
| Optimistic | <https://github.com/DimensionDev/Maskbook/pull/5284> |
