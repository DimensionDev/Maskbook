# Constants

## Usage

```typescript
const CONSTANTS = {
  CONST: {
      [ChainId.Mainnet]: '',
      [ChainId.Ropsten]: '',
      [ChainId.Rinkeby]: '',
      [ChainId.Kovan]: '',
      [ChainId.Gorli]: '',
      [ChainId.BSC]: '',
      [ChainId.BSCT]: '',
      [ChainId.Matic]: '',
      [ChainId.Mumbai]: '',
  },
}

// use constant in the JS runtime
const CONST = constantOfChain(CONSTANTS, ChainId.Mainnet)

// use constant in React hooks
const CONST = useConstantNext(CONSTANTS).CONST
```

## Automation

```bash
// create a chunk of constants which will be stored as `TOKENS.ts`
ts-node ./constants.ts create TOKENS

// add one field in CONSTANTS.ts
ts-node ./constants.ts add TOKENS DAI

// add many fileds in CONSTANST.ts
ts-node ./constants.ts add TOKENS DAI USDT USDC
```
