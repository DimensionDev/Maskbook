export enum TradeProvider {
    UNISWAP,
    ZRX, // 0x
    ONE_INCH,
    // SUSHISWAP,
}

// ZRX supported source swap list
// Learn more https://github.com/0xProject/0x-monorepo/blob/development/packages/asset-swapper/src/utils/market_operation_utils/types.ts#L27
export enum TradePool {
    ZRX,
    Uniswap,
    UniswapV2,
    Eth2Dai,
    Kyber,
    Curve,
    LiquidityProvider,
    MultiBridge,
    Balancer,
    Cream,
    Bancor,
    MStable,
    Mooniswap,
    MultiHop,
    Shell,
    Swerve,
    SnowSwap,
    SushiSwap,
    Dodo,
}

export enum TradeStrategy {
    ExactIn,
    ExactOut,
}

export enum TokenPanelType {
    Input,
    Output,
}
