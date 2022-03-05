import { ChainId, createERC20Tokens, createNativeToken, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export const LDO_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_ADDRESS', 'Lido DAO Token', 'LDO', 18)[ChainId.Mainnet],
    ],
]

export const CONVEX_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createERC20Tokens('USDT_ADDRESS', 'Tether USD', 'USDT', 6)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_USDT_LP_ADDRESS', 'Convex  USDT ', 'USDT', 6)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('USDC_ADDRESS', 'USDC', 'USDC', 18)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_USD_LP_ADDRESS', 'Convex  USD', 'USD', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('CVXFXS_ADDRESS', 'CVXFXS', 'CVXFXS', 18)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_CVXFXS_LP_ADDRESS', 'cvxfxs', 'cvxfxs', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('CONVEX_YPOOL_ADDRESS', 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD', 'cvxyDAI+yUSDC+yUSDT+yTUSDS', 18)[
            ChainId.Mainnet
        ],
        createERC20Tokens(
            'CONVEX_YPOOL_LP_ADDRESSS',
            'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
            'cvxyDAI+yUSDC+yUSDT+yTUSD',
            18,
        )[ChainId.Mainnet],
    ],
    [
        createERC20Tokens(
            'CONVEX_BUSD_ADDRESS',
            'Curve.fi yDAI/yUSDC/yUSDT/yBUSD Convex Deposit',
            'cvxyDAI+yUSDC+yUSDT+yBUSD',
            18,
        )[ChainId.Mainnet],
        createERC20Tokens(
            'CONVEX_BUSD_LP_ADDRESS',
            'Curve.fi yDAI/yUSDC/yUSDT/yBUSD Convex Deposit',
            'cvxyDAI+yUSDC+yUSDT+yBUSD',
            18,
        )[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('CONVEX_SUSD_ADDRESS', 'Curve.fi DAI/USDC/USDT/sUSD', 'crvPlain3andSUSD', 18)[
            ChainId.Mainnet
        ],
        createERC20Tokens('CONVEX_SUSD_LP_ADDRESS', 'Curve.fi DAI/USDC/USDT/sUSD', 'crvPlain3andSUSD', 18)[
            ChainId.Mainnet
        ],
    ],
    [
        createERC20Tokens('CONVEX_PAX_ADDRESS', 'Curve.fi DAI/USDC/USDT/PAX', 'ypaxCrv', 18)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_PAX_LP_ADDRESS', 'Curve.fi DAI/USDC/USDT/PAX', 'ypaxCrv', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('CONVEX_REN_ADDRESS', 'Curve.fi renBTC/wBTC', 'crvRenWBTC', 18)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_REN_LP_ADDRESS', 'Curve.fi renBTC/wBTC', 'crvRenWBTC', 18)[ChainId.Mainnet],
    ],
    [
        createERC20Tokens('CONVEX_SBTC_ADDRESS', 'Curve.fi renBTC/wBTC/sBTC Convex Deposit ', 'cvxcrvRenWSBTC', 18)[
            ChainId.Mainnet
        ],
        createERC20Tokens('CONVEX_SBTC_LP_ADDRESS', 'Curve.fi renBTC/wBTC/sBTC Convex Deposit ', 'cvxcrvRenWSBTC', 18)[
            ChainId.Mainnet
        ],
    ],
    [
        createERC20Tokens('CONVEX_HBTC_ADDRESS', 'Curve.fi hBTC/wBTC', 'hCRV ', 18)[ChainId.Mainnet],
        createERC20Tokens('CONVEX_HBTC_LP_ADDRESS', 'Curve.fi hBTC/wBTC', 'hCRV ', 18)[ChainId.Mainnet],
    ],
]
