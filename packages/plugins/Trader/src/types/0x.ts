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
    Mdex = 'Mdex',
    Arthswap = 'ArthSwap',
    Versa = 'Versa',
    VenomSwap = 'VenomSwap',
    OpenSwap = 'OpenSwap',
    DefiKingdoms = 'DefiKingdoms',
    YumiSwap = 'YumiSwap',
    AstarExchange = 'AstarExchange',
}

export interface SwapOrder {
    chainId: string
    exchangeAddress: string
    makerAddress: string
    takerAddress: string
    makerAssetData: string
    takerAssetData: string
    makerAssetAmount: string
    takerAssetAmount: string
    makerFee: string
    takerFee: string
    expirationTimeSeconds: string
    salt: string
    makerFeeAssetData: string
    takerFeeAssetData: string
    feeRecipientAddress: string
    senderAddress: string
    signature: string
}

export interface SwapProportion {
    name: ZrxTradePool
    proportion: string
}

// Learn more from https://0x.org/docs/api#request-1
export interface SwapQuoteRequest {
    sellToken: string
    buyToken: string
    sellAmount?: string
    buyAmount?: string
    /**
     * 1 - 100
     */
    slippagePercentage?: number
    gasPrice?: string
    takerAddress?: string
    includedSources?: ZrxTradePool[]
    excludedSources?: ZrxTradePool[]
    skipValidation?: boolean
    intentOnFilling?: boolean
    feeRecipient?: string
    /**
     * 1 - 100
     */
    buyTokenPercentageFee?: number
    affiliateAddress?: string
}

// Learn more from https://0x.org/docs/api#response-1
export interface SwapQuoteResponse {
    price: string
    guaranteedPrice: string
    to: string
    data: string
    value: string
    gasPrice: string
    gas: string
    estimatedGas: string
    protocolFee: string
    minimumProtocolFee: string
    buyAmount: string
    sellAmount: string
    sources: SwapProportion[]
    buyTokenAddress: string
    sellTokenAddress: string
    orders: SwapOrder[]
    estimatedGasTokenRefund: string
    allowanceTarget: string
    buyTokenToEthRate: string
    sellTokenToEthRate: string
}

export interface SwapValidationErrorResponse {
    code: number
    reason: string
    validationErrors: Array<{
        code: number
        field: string
        reason: string
    }>
}

export interface SwapServerErrorResponse {
    reason: string
}

export type SwapErrorResponse = SwapValidationErrorResponse | SwapServerErrorResponse
