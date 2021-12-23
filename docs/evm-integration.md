# A new EVM-compatible chain to Mask Network

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

### Token List

The team maintains a token list https://github.com/DimensionDev/Mask-Token-List. So free feel to create one for the chain. And add the token list link to `packages/web3-constants/evm/token-list.json`.

### Token Icon

The token icon could be read from the token list. Or in case of a network problem from a fallback link. Add the fallback links into `packages/web3-constants/evm/token-asset-base-url.json`.

### DEX

Mask Network has integrated Uniswap V2 and Uniswap V3 into the trader plugin. If the DEX of the chain is a fork from them can be easily configured. Learn more: `packages/web3-constants/evm/trader.json`.

For API-based DEX, please ref to how other DEXes integrated:

| DEX       | Pull Request Link                                  |
| --------- | -------------------------------------------------- |
| DODO      | https://github.com/DimensionDev/Maskbook/pull/3882 |
| OpenOcean | https://github.com/DimensionDev/Maskbook/pull/5198 |

### Deploy Contracts

If there is no one deployed [these contracts](https://github.com/DimensionDev/misc_smart_contract.) on the chain. Please contact the team.

- [ ] Multicall Contract
- [ ] BalanceChecker
- [ ] Other contracts from the Mask team

Congratulation! You have done the coding part.

## Testing Checklist

Before we ship the chain to the user, we need to do basic ability checks.

- [ ] Check if the asset list and transaction history on the dashboard page work when you choose the chain as the network.
  - Setup the chain for DeBank API.
- [ ] Check if the trending view is working. Try to hover a new chain token in any tweets.
  - Setup the chain for Coingecko API.
  - Setup the chain for CoinMarketCap API.

![image](https://user-images.githubusercontent.com/52657989/144754788-460bad98-bf62-4e5e-8592-ea8580430e63.png)

- [ ] Check if the gas estimate dialog is working.
  - Setup the chain for CoinGecko API.

Goto `chrome-extension://jkoeaghipilijlahjplgbfiocjhldnap/dashboard.html#/wallets/transfer` and check the estimated USD value is working.

![image](https://user-images.githubusercontent.com/52657989/144754866-9c5f389b-6eb4-4325-8f3d-ae53ee6e3b4a.png)

- [ ] Trade with the DEX on the chain.

  - Integrate a DEX for the chain.

- [ ] Send a transaction and check if the explorer links are working.
  - Setup metadata and RPC for the chain.

## Learn More

| Chain    | Pull Request Link                                  |
| -------- | -------------------------------------------------- |
| CELO     | https://github.com/DimensionDev/Maskbook/pull/5052 |
| Fantom   | https://github.com/DimensionDev/Maskbook/pull/5036 |
| xDai     | https://github.com/DimensionDev/Maskbook/pull/4140 |
| Arbitrum | https://github.com/DimensionDev/Maskbook/pull/3558 |
