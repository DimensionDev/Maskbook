import BigNumber from 'bignumber.js'
import { ChainId, ERC20TokenDetailed, createERC20Tokens, getChainDetailed } from '@dimensiondev/web3-shared'
import { ONE } from '@dimensiondev/maskbook-shared'

export const TRADE_CONSTANTS = {
    UNISWAP_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Ropsten]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Rinkeby]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Kovan]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.Gorli]: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    UNISWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Ropsten]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Rinkeby]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Kovan]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.Gorli]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    UNISWAP_THEGRAPH: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    UNISWAP_INIT_CODE_HASH: {
        [ChainId.Mainnet]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        [ChainId.Ropsten]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        [ChainId.Rinkeby]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        [ChainId.Kovan]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        [ChainId.Gorli]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SUSHISWAP_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Ropsten]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Rinkeby]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Kovan]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.Gorli]: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SUSHISWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SUSHISWAP_THEGRAPH: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SUSHISWAP_INIT_CODE_HASH: {
        [ChainId.Mainnet]: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SASHIMISWAP_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: ' 0x31db862df7be09718a860c46ab17ca57966e69ed',
        [ChainId.Ropsten]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
        [ChainId.Rinkeby]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
        [ChainId.Kovan]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
        [ChainId.Gorli]: '0xe4fe6a45f354e845f954cddee6084603cedb9410',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SASHIMISWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '0xF028F723ED1D0fE01cC59973C49298AA95c57472',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SASHIMISWAP_THEGRAPH: {
        [ChainId.Mainnet]: 'https://api.thegraph.com/subgraphs/name/sashimiproject/sashimi',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    SASHIMISWAP_INIT_CODE_HASH: {
        [ChainId.Mainnet]: '0xb465bbe4edb8c9b0da8ff0b2b36ce0065de9fcd5a33f32c6856ea821779c8b72',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    QUICKSWAP_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '0xA97788A1b51938216305dBe8B16670C4aCfec612',
        [ChainId.Mumbai]: '',
    },
    QUICKSWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
        [ChainId.Mumbai]: '',
    },
    QUICKSWAP_THEGRAPH: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: 'https://api.thegraph.com/subgraphs/name/sameepsi/quickswap',
        [ChainId.Mumbai]: '',
    },
    QUICKSWAP_INIT_CODE_HASH: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
        [ChainId.Mumbai]: '',
    },
    PANCAKESWAP_ROUTER_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    PANCAKESWAP_FACTORY_ADDRESS: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    PANCAKESWAP_THEGRAPH: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: 'https://thegraph.com/explorer/subgraph/pancakeswap/exchange',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    PANCAKESWAP_INIT_CODE_HASH: {
        [ChainId.Mainnet]: '',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '0x00fb7f630766e6a796048ea87d01acd3068e8ff67d078148a3fa3f4a84f69bd5',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    BALANCER_ETH_ADDRESS: {
        [ChainId.Mainnet]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Ropsten]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Rinkeby]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Kovan]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.Gorli]: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    BALANCER_EXCHANGE_PROXY_ADDRESS: {
        [ChainId.Mainnet]: '0x3E66B66Fd1d0b02fDa6C811Da9E0547970DB2f21',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]: '0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
    BALANCER_POOLS_URL: {
        [ChainId.Mainnet]: 'https://ipfs.fleek.co/ipns/balancer-bucket.storage.fleek.co/balancer-exchange/pools',
        [ChainId.Ropsten]: '',
        [ChainId.Rinkeby]: '',
        [ChainId.Kovan]:
            'https://ipfs.fleek.co/ipns/balancer-team-bucket.storage.fleek.co/balancer-exchange-kovan/pools',
        [ChainId.Gorli]: '',
        [ChainId.BSC]: '',
        [ChainId.BSCT]: '',
        [ChainId.Matic]: '',
        [ChainId.Mumbai]: '',
    },
}

export const USDC = createERC20Tokens('USDC_ADDRESS', 'USD Coin', 'USDC', 6)
export const USDT = createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)
export const HUSD = createERC20Tokens('HUSD_ADDRESS', 'Huobi USD', 'HUSD', 6)
export const BUSD = createERC20Tokens('BUSD_ADDRESS', 'Huobi USD', 'BUSD', 6)
export const COMP = createERC20Tokens('COMP_ADDRESS', 'Compound', 'COMP', 18)
export const MKR = createERC20Tokens('MKR_ADDRESS', 'Maker', 'MKR', 18)
export const MSKA = createERC20Tokens('MSKA_ADDRESS', 'Mask A', 'MSKA', 18)
export const MSKB = createERC20Tokens('MSKB_ADDRESS', 'Mask B', 'MSKB', 18)
export const MSKC = createERC20Tokens('MSKC_ADDRESS', 'Mask C', 'MSKC', 18)
export const MSKD = createERC20Tokens('MSKD_ADDRESS', 'Mask D', 'MSKD', 18)
export const MSKE = createERC20Tokens('MSKE_ADDRESS', 'Mask E', 'MSKE', 18)
export const DAI = createERC20Tokens('DAI_ADDRESS', 'Dai Stablecoin', 'DAI', 18)
export const AMPL = createERC20Tokens('AMPL_ADDRESS', 'Ampleforth', 'AMPL', 18)
export const OKB = createERC20Tokens('OKB_ADDRESS', 'Ampleforth', 'OKB', 18)
export const UST = createERC20Tokens('UST_ADDRESS', 'Wrapped UST Token', 'UST', 18)
export const EASY = createERC20Tokens('EASY_ADDRESS', 'EASY', 'EASY', 18)
export const eUSDC = createERC20Tokens('eUSDC_ADDRESS', 'Easy USDC', 'eUSDC', 18)
export const eUSDT = createERC20Tokens('eUSDT_ADDRESS', 'Easy USDT', 'eUSDT', 18)
export const eDAI = createERC20Tokens('eDAI_ADDRESS', 'Easy DAI', 'eDAI', 18)
export const sUSD = createERC20Tokens('sUSD_ADDRESS', 'Synth sUSD', 'sUSD', 18)
export const UNITOKEN = createERC20Tokens('UNITOKEN_ADDRESS', 'Uniswap', 'UNI', 18)
export const TT01 = createERC20Tokens('TT01_ADDRESS', 'Test Token 01', 'TT01', 18)
export const TT02 = createERC20Tokens('TT02_ADDRESS', 'Test Token 02', 'TT02', 18)
export const ETHER = createERC20Tokens('ETHER_ADDRESS', 'Ether', 'ETH', 18)
export const QUICK = createERC20Tokens('QUICK_ADDRESS', 'Quickswap', 'QUICK', 18)
export const WBTC = createERC20Tokens('WBTC_ADDRESS', 'Wrapped Bitcoin', 'WBTC', 18)
export const IGG = createERC20Tokens('IGG_ADDRESS', 'IG Gold', 'IGG', 18)
export const OM = createERC20Tokens('OM_ADDRESS', 'OM Token', 'OM', 18)
export const SUSHI = createERC20Tokens('SUSHI_ADDRESS', 'SushiToken', 'SUSHI', 18)
export const YAM = createERC20Tokens('YAM_ADDRESS', 'YAM', 'YAM', 18)
export const RUNE = createERC20Tokens('RUNE_ADDRESS', 'RUNE.ETH', 'RUNE', 18)
export const YFI = createERC20Tokens('YFI_ADDRESS', 'Yearn', 'YFI', 18)
export const BTCB = createERC20Tokens('BTCB_ADDRESS', 'Binance BTC', 'BTCB', 18)
export const CAKE = createERC20Tokens('CAKE_ADDRESS', 'PancakeSwap Token', 'CAKE', 18)

export const WETH = createERC20Tokens(
    'WETH_ADDRESS',
    (chainId) => `Wrapped ${getChainDetailed(chainId)?.nativeCurrency.name ?? 'Ether'}`,
    (chainId) => `W${getChainDetailed(chainId)?.nativeCurrency.symbol ?? 'ETH'}`,
    18,
)

export const WETH_ONLY: {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
} = {
    [ChainId.Mainnet]: [WETH[ChainId.Mainnet]],
    [ChainId.Ropsten]: [WETH[ChainId.Ropsten]],
    [ChainId.Rinkeby]: [WETH[ChainId.Rinkeby]],
    [ChainId.Kovan]: [WETH[ChainId.Kovan]],
    [ChainId.Gorli]: [WETH[ChainId.Gorli]],
    [ChainId.BSC]: [WETH[ChainId.BSC]],
    [ChainId.BSCT]: [WETH[ChainId.BSCT]],
    [ChainId.Matic]: [WETH[ChainId.Matic]],
    [ChainId.Mumbai]: [WETH[ChainId.Mumbai]],
}

export const BIPS_BASE = new BigNumber(10000)
export const ONE_BIPS = ONE.dividedBy(BIPS_BASE)

export const SLIPPAGE_TOLERANCE_MIN = 10 // bips
export const SLIPPAGE_TOLERANCE_DEFAULT = 50 // bips
export const SLIPPAGE_TOLERANCE_MAX = 500 // bips

export const DEFAULT_TRANSACTION_DEADLINE = 20 /* minutes */ * 60 /* seconds */

export const PRICE_IMPACT_LOW = 100 // 1%
export const PRICE_IMPACT_MEDIUM = 300 // 3%
export const PRICE_IMPACT_HIGH = 500 // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN = 1000 // 10%
// for non expert mode disable swaps above this
export const PRICE_IMPACT_NON_EXPERT_BLOCKED = 1500 // 15%

export const MINIMUM_AMOUNT = new BigNumber('1e-6')
