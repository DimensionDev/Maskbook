import { ChainId, createERC20Tokens, FungibleTokenDetailed, NetworkType } from '@masknet/web3-shared-evm'
import { getTokenConstants } from '../../../../../web3-shared/evm/constants/index'

export const VENUS_BASE_URL: Record<NetworkType, string> = {
    [NetworkType.Ethereum]: '',
    [NetworkType.Binance]: 'https://api.venus.io/api',
    [NetworkType.Polygon]: '',
    [NetworkType.Arbitrum]: '',
    [NetworkType.xDai]: '',
    [NetworkType.Avalanche]: '',
    [NetworkType.Celo]: '',
    [NetworkType.Fantom]: '',
    [NetworkType.Aurora]: '',
    [NetworkType.Boba]: '',
    [NetworkType.Fuse]: '',
    [NetworkType.Metis]: '',
    [NetworkType.Optimistic]: '',
}

export const VENUS_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/venusprotocol/venus-subgraph'

export const connectorLocalStorageKey = 'venus-local-key'

export const vtokenDecimals = 8

export const VENUS_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createERC20Tokens('NATIVE_TOKEN_ADDRESS', 'BNB', 'BNB', 6)[ChainId.BSC],
        createERC20Tokens('vBNB_ADDRESS', 'Venus BNB', 'vBNB', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('SXP_ADDRESS', 'SXP', 'SXP', 6)[ChainId.BSC],
        createERC20Tokens('vSXP_ADDRESS', 'Venus SXP', 'vSXP', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('USDC_ADDRESS', 'USDC', 'USDC', 6)[ChainId.BSC],
        createERC20Tokens('vUSDC_ADDRESS', 'Venus USDC', 'vUSDC', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('USDT_ADDRESS', 'USDT', 'USDT', 6)[ChainId.BSC],
        createERC20Tokens('vUSDT_ADDRESS', 'Venus USDT', 'vUSDT', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('BUSD_ADDRESS', 'BUSD', 'BUSD', 6)[ChainId.BSC],
        createERC20Tokens('vBUSD_ADDRESS', 'Venus BUSD', 'vBUSD', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('XVS_ADDRESS', 'XVS', 'XVS', 6)[ChainId.BSC],
        createERC20Tokens('vXVS_ADDRESS', 'Venus XVS', 'vXVS', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('BTCB_ADDRESS', 'BTCB', 'BTCB', 6)[ChainId.BSC],
        createERC20Tokens('vBTCB_ADDRESS', 'Venus BTCB', 'vBTCB', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('ETHER_ADDRESS', 'ETH', 'ETH', 6)[ChainId.BSC],
        createERC20Tokens('vETH_ADDRESS', 'Venus ETH', 'vETH', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('LTC_ADDRESS', 'LTC', 'LTC', 6)[ChainId.BSC],
        createERC20Tokens('vLTC_ADDRESS', 'Venus LTC', 'vLTC', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('XRP_ADDRESS', 'XRP', 'XRP', 6)[ChainId.BSC],
        createERC20Tokens('vXRP_ADDRESS', 'Venus XRP', 'vXRP', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('BCH_ADDRESS', 'BCH', 'BCH', 6)[ChainId.BSC],
        createERC20Tokens('vBCH_ADDRESS', 'Venus BCH', 'vBCH', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('DOT_ADDRESS', 'DOT', 'DOT', 6)[ChainId.BSC],
        createERC20Tokens('vDOT_ADDRESS', 'Venus DOT', 'vDOT', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('LINK_ADDRESS', 'LINK', 'LINK', 6)[ChainId.BSC],
        createERC20Tokens('vLINK_ADDRESS', 'Venus LINK', 'vLINK', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('DAI_ADDRESS', 'DAI', 'DAI', 6)[ChainId.BSC],
        createERC20Tokens('vDAI_ADDRESS', 'Venus DAI', 'vDAI', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('FIL_ADDRESS', 'FIL', 'FIL', 6)[ChainId.BSC],
        createERC20Tokens('vFIL_ADDRESS', 'Venus FIL', 'vFIL', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('BETH_ADDRESS', 'BETH', 'BETH', 6)[ChainId.BSC],
        createERC20Tokens('vBETH_ADDRESS', 'Venus BETH', 'vBETH', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('ADA_ADDRESS', 'ADA', 'ADA', 6)[ChainId.BSC],
        createERC20Tokens('vADA_ADDRESS', 'Venus ADA', 'vADA', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('DOGE_ADDRESS', 'DOGE', 'DOGE', 6)[ChainId.BSC],
        createERC20Tokens('vDOGE_ADDRESS', 'Venus DOGE', 'vDOGE', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('CAKE_ADDRESS', 'CAKE', 'CAKE', 6)[ChainId.BSC],
        createERC20Tokens('vCAKE_ADDRESS', 'Venus CAKE', 'vCAKE', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('MATIC_ADDRESS', 'MATIC', 'MATIC', 6)[ChainId.BSC],
        createERC20Tokens('vMATIC_ADDRESS', 'Venus MATIC', 'vMATIC', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('AAVE_ADDRESS', 'AAVE', 'AAVE', 6)[ChainId.BSC],
        createERC20Tokens('vAAVE_ADDRESS', 'Venus AAVE', 'vAAVE', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('TUSD_ADDRESS', 'TUSD', 'TUSD', 6)[ChainId.BSC],
        createERC20Tokens('vTUSD_ADDRESS', 'Venus TUSD', 'vTUSD', vtokenDecimals)[ChainId.BSC],
    ],
    [
        createERC20Tokens('TRX_ADDRESS', 'TRX', 'TRX', 6)[ChainId.BSC],
        createERC20Tokens('vTRX_ADDRESS', 'Venus TRX', 'vTRX', vtokenDecimals)[ChainId.BSC],
    ],
]

export const CONTRACT_VBEP_ADDRESS = [
    {
        id: 'sxp',
        symbol: 'vSXP',
        address: getTokenConstants(ChainId.BSC).vSXP_ADDRESS,
    },
    {
        id: 'usdc',
        symbol: 'vUSDC',
        address: getTokenConstants(ChainId.BSC).vUSDC_ADDRESS,
    },
    {
        id: 'usdt',
        symbol: 'vUSDT',
        address: getTokenConstants(ChainId.BSC).vUSDC_ADDRESS,
    },
    {
        id: 'busd',
        symbol: 'vBUSD',
        address: getTokenConstants(ChainId.BSC).vBUSD_ADDRESS,
    },
    {
        id: 'bnb',
        symbol: 'vBNB',
        address: getTokenConstants(ChainId.BSC).vBNB_ADDRESS,
    },
    {
        id: 'xvs',
        symbol: 'vXVS',
        address: getTokenConstants(ChainId.BSC).vXVS_ADDRESS,
    },
    {
        id: 'btcb',
        symbol: 'vBTC',
        address: getTokenConstants(ChainId.BSC).vBTCB_ADDRESS,
    },
    {
        id: 'eth',
        symbol: 'vETH',
        address: getTokenConstants(ChainId.BSC).vETH_ADDRESS,
    },
    {
        id: 'ltc',
        symbol: 'vLTC',
        address: getTokenConstants(ChainId.BSC).vLTC_ADDRESS,
    },
    {
        id: 'xrp',
        symbol: 'vXRP',
        address: getTokenConstants(ChainId.BSC).vXRP_ADDRESS,
    },
    {
        id: 'bch',
        symbol: 'vBCH',
        address: getTokenConstants(ChainId.BSC).vBCH_ADDRESS,
    },
    {
        id: 'dot',
        symbol: 'vDOT',
        address: getTokenConstants(ChainId.BSC).vDOT_ADDRESS,
    },
    {
        id: 'link',
        symbol: 'vLINK',
        address: getTokenConstants(ChainId.BSC).vLINK_ADDRESS,
    },
    {
        id: 'dai',
        symbol: 'vDAI',
        address: getTokenConstants(ChainId.BSC).vDAI_ADDRESS,
    },
    {
        id: 'fil',
        symbol: 'vFIL',
        address: getTokenConstants(ChainId.BSC).vFIL_ADDRESS,
    },
    {
        id: 'beth',
        symbol: 'vBETH',
        address: getTokenConstants(ChainId.BSC).vBETH_ADDRESS,
    },
    {
        id: 'ada',
        symbol: 'vADA',
        address: getTokenConstants(ChainId.BSC).vADA_ADDRESS,
    },
    {
        id: 'doge',
        symbol: 'vDOGE',
        address: getTokenConstants(ChainId.BSC).vDOGE_ADDRESS,
    },
    {
        id: 'matic',
        symbol: 'vMATIC',
        address: getTokenConstants(ChainId.BSC).vMATIC_ADDRESS,
    },
    {
        id: 'cake',
        symbol: 'vCAKE',
        address: getTokenConstants(ChainId.BSC).vCAKE_ADDRESS,
    },
    {
        id: 'aave',
        symbol: 'vAAVE',
        address: getTokenConstants(ChainId.BSC).vAAVE_ADDRESS,
    },
    {
        id: 'tusd',
        symbol: 'vTUSD',
        address: getTokenConstants(ChainId.BSC).vTUSD_ADDRESS,
    },
    {
        id: 'trx',
        symbol: 'vTRX',
        address: getTokenConstants(ChainId.BSC).vTRX_ADDRESS,
    },
]

export const CONTRACT_TOKEN_ADDRESS = [
    {
        id: 'sxp',
        symbol: 'SXP',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).SXP_ADDRESS,
    },
    {
        id: 'usdc',
        symbol: 'USDC',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).USDC_ADDRESS,
    },
    {
        id: 'usdt',
        symbol: 'USDT',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).USDT_ADDRESS,
    },
    {
        id: 'busd',
        symbol: 'BUSD',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).BUSD_ADDRESS,
    },
    {
        id: 'bnb',
        symbol: 'BNB',
        decimals: 18,
    },
    {
        id: 'xvs',
        symbol: 'XVS',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).XVS_ADDRESS,
    },
    {
        id: 'btcb',
        symbol: 'BTCB',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).BTCB_ADDRESS,
    },
    {
        id: 'eth',
        symbol: 'ETH',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).ETHER_ADDRESS,
    },
    {
        id: 'ltc',
        symbol: 'LTC',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).LTC_ADDRESS,
    },
    {
        id: 'xrp',
        symbol: 'XRP',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).XRP_ADDRESS,
    },
    {
        id: 'bch',
        symbol: 'BCH',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).BCH_ADDRESS,
    },
    {
        id: 'dot',
        symbol: 'DOT',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).DOT_ADDRESS,
    },
    {
        id: 'link',
        symbol: 'LINK',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).LINK_ADDRESS,
    },
    {
        id: 'dai',
        symbol: 'DAI',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).DAI_ADDRESS,
    },
    {
        id: 'fil',
        symbol: 'FIL',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).FIL_ADDRESS,
    },
    {
        id: 'beth',
        symbol: 'BETH',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).BETH_ADDRESS,
    },
    {
        id: 'ada',
        symbol: 'ADA',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).ADA_ADDRESS,
    },
    {
        id: 'doge',
        symbol: 'DOGE',
        decimals: 8,
        address: getTokenConstants(ChainId.BSC).DOGE_ADDRESS,
    },
    {
        id: 'matic',
        symbol: 'MATIC',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).MATIC_ADDRESS,
    },
    {
        id: 'cake',
        symbol: 'Cake',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).CAKE_ADDRESS,
    },
    {
        id: 'aave',
        symbol: 'AAVE',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).AAVE_ADDRESS,
    },
    {
        id: 'tusd',
        symbol: 'TUSD',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).TUSD_ADDRESS,
    },
    {
        id: 'trx',
        symbol: 'TRX',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).TRX_ADDRESS,
    },
    {
        id: 'vai',
        symbol: 'VAI',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).VAI_ADDRESS,
    },
    {
        id: 'vrt',
        symbol: 'VRT',
        decimals: 18,
        address: getTokenConstants(ChainId.BSC).VRT_ADDRESS,
    },
]
