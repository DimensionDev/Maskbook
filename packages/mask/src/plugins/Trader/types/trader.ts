import type BigNumber from 'bignumber.js'
import type { ChainId, ChainIdOptionalRecord, SchemaType } from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'
import type { FungibleToken } from '@masknet/web3-shared-base'

export enum WarningLevel {
    LOW = 1,
    MEDIUM = 2,
    HIGH = 3,
    CONFIRMATION_REQUIRED = 4,
    BLOCKED = 5,
}

// ZRX supported source swap list
// Learn more: https://matcha.xyz/
export enum ZrxTradePool {
    ZRX = '0x',
    ACryptoS = 'ACryptoS',
    ApeSwap = 'ApeSwap',
    BakerySwap = 'BakerySwap',
    Balancer = 'Balancer',
    BalancerV2 = 'Balancer_V2',
    Bancor = 'Bancor',
    Belt = 'Belt',
    CafeSwap = 'CafeSwap',
    CheeseSwap = 'CheeseSwap',
    ComethSwap = 'ComethSwap',
    Component = 'Component',
    Cream = 'CREAM',
    CryptoCom = 'CryptoCom',
    Curve = 'Curve',
    CurveV2 = 'Curve_V2',
    Dfyn = 'Dfyn',
    Dodo = 'DODO',
    DodoV2 = 'DODO_V2',
    Ellipsis = 'Ellipsis',
    Eth2Dai = 'Eth2Dai',
    FirebirdOneSwap = 'FirebirdOneSwap',
    IronSwap = 'IronSwap',
    JetSwap = 'JetSwap',
    JulSwap = 'JulSwap',
    Kyber = 'Kyber',
    KyberDMM = 'KyberDMM',
    Lido = 'Lido',
    Linkswap = 'Linkswap',
    LiquidityProvider = 'LiquidityProvider',
    MStable = 'mStable',
    MakerPsm = 'MakerPsm',
    Mesh = 'Mesh',
    Mooniswap = 'Mooniswap',
    MultiBridge = 'MultiBridge',
    MultiHop = 'MultiHop',
    Native = 'Native',
    Nerve = 'Nerve',
    Oasis = 'Oasis',
    PancakeSwap = 'PancakeSwap',
    PancakeSwapV2 = 'PancakeSwap_V2',
    QuickSwap = 'QuickSwap',
    Saddle = 'Saddle',
    Shell = 'Shell',
    Smoothy = 'Smoothy',
    SnowSwap = 'SnowSwap',
    SushiSwap = 'SushiSwap',
    Swerve = 'Swerve',
    Uniswap = 'Uniswap',
    UniswapV2 = 'Uniswap_V2',
    UniswapV3 = 'Uniswap_V3',
    WaultSwap = 'WaultSwap',
    xSigma = 'xSigma',
    TraderJoe = 'TraderJoe',
    PangolinDex = 'PangolinDex',
    Trisolaris = 'Trisolaris',
    WannaSwap = 'WannaSwap',
    StellaSwap = 'StellaSwap',
    BeamSwap = 'BeamSwap',
    PADSwap = 'PADSwap',
    Mdex = 'Mdex',
    ZenLink = 'ZenLink',
    SolFlare = 'SolFlare',
    VenomSwap = 'VenomSwap',
    OpenSwap = 'OpenSwap',
    DefiKingdoms = 'DefiKingdoms',
}

export interface TradeComputed<T = unknown> {
    strategy: TradeStrategy
    inputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    outputToken?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>
    inputAmount: BigNumber
    outputAmount: BigNumber
    executionPrice: BigNumber
    priceImpact: BigNumber
    maximumSold: BigNumber
    minimumReceived: BigNumber
    fee: BigNumber
    path?: Array<
        Array<
            | PartialRequired<FungibleToken<ChainId, SchemaType.Native>, 'address'>
            | PartialRequired<FungibleToken<ChainId, SchemaType.ERC20>, 'address'>
        >
    >
    trade_?: T
}

export enum TradeStrategy {
    ExactIn = 0,
    ExactOut = 1,
}

export enum TokenPanelType {
    Input = 0,
    Output = 1,
}

export interface TradeContext {
    TYPE: TradeProvider
    IS_UNISWAP_V2_LIKE?: boolean
    IS_UNISWAP_V3_LIKE?: boolean
    GRAPH_API?: string
    INIT_CODE_HASH?: string
    ROUTER_CONTRACT_ADDRESS?: string
    FACTORY_CONTRACT_ADDRESS?: string
    SPENDER_CONTRACT_ADDRESS?: string
    ADDITIONAL_TOKENS?: ChainIdOptionalRecord<
        Record<string, Array<FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>>>
    >
    AGAINST_TOKENS?: ChainIdOptionalRecord<Array<FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>>>
    CUSTOM_TOKENS?: ChainIdOptionalRecord<
        Record<string, Array<FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>>>
    >
}

export interface TradeInfo {
    loading: boolean
    retry: () => void
    value: TradeComputed | null
    provider: TradeProvider
    error?: Error
    gas: { value?: number; loading: boolean }
    finalPrice?: BigNumber.Value
}
