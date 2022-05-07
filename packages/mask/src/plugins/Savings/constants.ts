import {
    ChainId,
    getBenQiConstants,
    getAurigamiConstants,
    getTranquilConstants,
    getCompoundConstants,
    createERC20Tokens,
    createNativeToken,
    FungibleTokenDetailed,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
export const SAVINGS_PLUGIN_NAME = 'Savings'
export const SAVINGS_PLUGIN_ID = 'com.savings'

export const LDO_PAIRS: [FungibleTokenDetailed, FungibleTokenDetailed][] = [
    [
        createNativeToken(ChainId.Mainnet),
        createERC20Tokens('LDO_stETH_ADDRESS', 'Liquid staked Ether 2.0', 'stETH', 18)[ChainId.Mainnet],
    ],
]

export const COMPOUND_COMPTROLLER = getCompoundConstants(ChainId.Mainnet).COMPTROLLER || ZERO_ADDRESS

export const BENQI_COMPTROLLER = getBenQiConstants(ChainId.Avalanche).COMPTROLLER || ZERO_ADDRESS
export const BENQI_ChainlinkOracle = getBenQiConstants(ChainId.Avalanche).ORACLE || ZERO_ADDRESS

export const AURIGAMI_COMPTROLLER = getAurigamiConstants(ChainId.Aurora).COMPTROLLER || ZERO_ADDRESS
export const AURIGAMI_ORACLE = getAurigamiConstants(ChainId.Aurora).ORACLE || ZERO_ADDRESS
export const AURIGAMI_LENS = getAurigamiConstants(ChainId.Aurora).LENS || ZERO_ADDRESS

export const TRANQUIL_COMPTROLLER = getTranquilConstants(ChainId.Harmony).COMPTROLLER || ZERO_ADDRESS
export const TRANQUIL_Oracle = getTranquilConstants(ChainId.Harmony).ORACLE || ZERO_ADDRESS
export const TRANQ_ADDRESS = getTranquilConstants(ChainId.Harmony).TRANQ || ZERO_ADDRESS
