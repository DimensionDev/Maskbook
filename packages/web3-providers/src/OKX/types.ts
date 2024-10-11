import type { ChainId } from '@masknet/web3-shared-evm'

/** https://www.okx.com/web3/build/docs/waas/okx-waas-standard */
type OKXResponse<T> = {
    /**
     * the server returns string, but we will convert to number after request
     * to align to OKX private api
     */
    code: number
    msg: string
    data: T
}

export interface ChainDex {
    /** API response string, we convert to number */
    chainId: number
    chainName: string
    /** would be empty string for non-ethereum chains */
    dexTokenApproveAddress: string
}

export type SupportedChainResponse = OKXResponse<ChainDex[]>

export type GetTokensResponse = OKXResponse<
    Array<{
        /**
         * @example "18"
         * /api/v5/dex/aggregator/all-tokens responses decimals in string,
         * but we will convert it to number as
         * /api/v5/dex/cross-chain/supported/tokens responses in number
         * */
        decimals: number
        /** @example "0x382bb369d343125bfb2117af9c149795c6c65c50" */
        tokenContractAddress: string
        /** @example "https://static.okx.com/cdn/wallet/logo/USDT-991ffed9-e495-4d1b-80c2-a4c5f96ce22d.png" */
        tokenLogoUrl: string
        /** @example "Tether" */
        tokenName: string
        /** @example "USDT" */
        tokenSymbol: string
    }>
>

export type GetTokenPairsResponse = OKXResponse<
    Array<{
        /** API response string, we convert to number */
        fromChainId: number
        /** API response string, we convert to number */
        toChainId: number
        fromTokenAddress: HexString
        toTokenAddress: HexString
        fromTokenSymbol: string
        toTokenSymbol: string
    }>
>

export type SupportedBridgesResponse = OKXResponse<
    Array<{
        bridgeId: number
        bridgeName: string
        requireOtherNativeFee: boolean
        /** chainId list */
        supportedChains: number[]
    }>
>

export type GetLiquidityResponse = OKXResponse<
    Array<{
        /** @example "1" */
        id: string
        /** @example "Uniswap V2" */
        name: string
        /** Official API does provides logo */
        logo: string
    }>
>

export interface ApproveTransactionOptions {
    chainId: number
    tokenContractAddress: string
    approveAmount: string
}

export type ApproveTransactionResponse = OKXResponse<
    Array<{
        /** @example "0x095ea7b3000000000000000000000000c67879f4065d3b9fe1c09ee990b891aa8e3a4c2f00000000000000000000000000000000000000000000000000000000000f4240" */
        data: string
        /** @example "0xc67879F4065d3B9fe1C09EE990B891Aa8E3a4c2f" */
        dexContractAddress: string
        /** @example "100000" */
        gasLimit: string
        /**
         * Gas price in wei
         * @example "100000000000000"
         */
        gasPrice: string
    }>
>

export interface GetQuotesOptions {
    /** Chain ID (e.g., 1 for Ethereum) */
    chainId: string
    /** The input amount of a token to be sold (in minimal divisible units) */
    amount: string
    /** The contract address of a token to be sold */
    fromTokenAddress: string
    /** The contract address of a token to be bought */
    toTokenAddress: string
    /** DexId of the liquidity pool for limited quotes, multiple combinations separated by comma */
    dexIds?: string
    /**
     * The percentage (between 0 - 1.0) of the price impact allowed
     * @default 0.9
     */
    priceImpactProtectionPercentage?: string
    /**
     * The percentage of fromTokenAmount to be sent to the referrer's address
     * @min 0
     * @max 3
     */
    feePercent?: string
}

export interface SwapToken {
    /**
     * @deprecated use decimals instead, which aligns to bridge API
     */
    decimal: string
    /**
     * OKX API doesn't provide chainId in such token, We patch at runtime
     */
    chainId?: number
    /**
     * Swap API has no decimals, we convert from decimal, to align to token in bridge API */
    decimals: number
    /** @example "0x382bb369d343125bfb2117af9c149795c6c65c50" */
    tokenContractAddress: string
    /** @example "USDC" */
    tokenSymbol: string
    /**
     * @example "0.9998542668416743"
     * Bridge quote API has no tokenUnitPrice, we get it in favor of swap quote API, see OKX.getTokenPrice
     * */
    tokenUnitPrice: string
}

export interface OKXSwapQuote {
    chainId: string
    dexRouterList: DexRouter[]
    /** It's gas limit actually */
    estimateGasFee: string
    fromToken: SwapToken
    /** Amount of fromToken */
    fromTokenAmount: string
    quoteCompareList: Array<{
        amountOut: string
        dexLogo: string
        dexName: string
        /** Estimated network fee (USD) of the quote route */
        tradeFee: string
    }>
    toToken: SwapToken
    /** Amount of toToken */
    toTokenAmount: string
}

export type GetQuotesResponse = OKXResponse<OKXSwapQuote[]>

export type SwapOptions = {
    /** Chain ID */
    chainId: string
    /** The input amount of a token to be sold */
    amount: string
    /** The contract address of a token you want to send */
    fromTokenAddress: string
    /** The contract address of a token you want to receive */
    toTokenAddress: string
    /** The slippage you are willing to accept */
    slippage: string
    /** The user's wallet address */
    userWalletAddress: string
    /** The referrer's address (optional) */
    referrerAddress?: string
    /** The address to receive the swapped tokens (optional) */
    swapReceiverAddress?: string
    /** The fee percentage (optional) */
    feePercent?: string
    /** The gas limit (optional). */
    gaslimit?: string
    /** The gas level (optional) */
    gasLevel?: string
    /** The DEX IDs (optional) */
    dexIds?: string
    /** The price impact protection percentage (optional) */
    priceImpactProtectionPercentage?: string
    /** You can customize the parameters to be sent on the blockchain in callData by encoding the data into a 128-character 64-bytes hexadecimal string. */
    callDataMemo?: string
    /** Used for transactions on the solana network and analogous to gasPrice on Ethereum, which determines the priority level of the transaction. The higher the price, the more likely that the transaction can be processed faster. */
    computeUnitPrice?: string
    /** Used for transactions on the solana network and analogous to gasLimit on Ethereum, which ensures that the transaction won’t take too much computing resource. */
    computeUnitLimit?: string
}

export interface OkxTx {
    from: string
    gas: string
    gasPrice: string
    maxPriorityFeePerGas: string
    to: string
    value: string
    minReceiveAmount: string
    data: string
}
interface DexProtocol {
    /** @example "Uniswap V3" */
    dexName: string
    percent: string
}

export type SwapResponse = OKXResponse<
    Array<{
        routerResult: {
            chainId: string
            /** the input amount of a token to be sold */
            fromTokenAmount: string
            /** the output amount of a token to be received */
            toTokenAmount: string
            /** It's gas limit actually */
            estimateGasFee: string
            /** The list of DEX routers */
            dexRouterList: Array<{
                /** The router address */
                router: string
                /**
                 * The percentage of assets handled by the main path
                 * @example "5"
                 */
                routerPercent: string
                /** Quote path sub data set */
                subRouterList: Array<{
                    /** Liquidity protocols used on the main path */
                    dexProtocol: DexProtocol[]
                    fromToken: SwapToken
                    toToken: SwapToken
                }>
            }>
            fromToken: SwapToken
            toToken: SwapToken
            quoteCompareList: Array<{
                dexName: string
                dexLogo: string
                tradeFee: string
                receiveAmount: string
            }>
        }
        tx: OkxTx
    }>
>

/**
 * Options for getting a cross-chain quote
 */
export interface GetBridgeQuoteOptions {
    /** Source chain ID (e.g., '1' for Ethereum) */
    fromChainId: string

    /** Destination chain ID (e.g., '1' for Ethereum) */
    toChainId: string

    /** The contract address of the token to be sold */
    fromTokenAddress: string

    /** The contract address of the token to be bought */
    toTokenAddress: string

    /**
     * The input amount of the token to be sold, in minimal divisible units
     * (e.g., '1000000' for 1.00 USDT, '1000000000000000000' for 1.00 DAI)
     */
    amount: string

    /**
     * Cross-chain swap route preference
     * 0: Default route (most tokens)
     * 1: Optimal route (considering fees and costs)
     * 2: Quickest route (least swap time)
     */
    sort?: 0 | 1 | 2

    /**
     * The acceptable slippage, as a decimal string
     * (e.g., '0.005' for 0.5% slippage)
     * min: 0.002, max: 0.5
     */
    slippage: string

    /**
     * The percentage of fromTokenAmount to be sent to the referrer's address
     * min: 0, max: 3 (as a decimal string, e.g., '0.01' for 1%)
     */
    feePercent?: string

    /** Array of bridge IDs to include in routes */
    allowBridge?: number[]

    /** Array of bridge IDs to exclude from routes */
    denyBridge?: number[]

    /**
     * The maximum allowed price impact, as a decimal string
     * (e.g., '0.25' for 25% maximum price impact)
     * Default is '0.9' (90%). Set to '1.0' to disable.
     */
    priceImpactProtectionPercentage?: string
}

/** Represents bridge information */
type Router = {
    /** Bridge ID (e.g., 211) */
    bridgeId: number
    /** Name of bridge (e.g., cBridge) */
    bridgeName: string
    /** Native token fee for certain cross-chain bridges */
    otherNativeFee: string
    /** The cross-chain bridge fee charged by the bridge, usually in stablecoin or WETH */
    crossChainFee: string
    /** The cross-chain bridge fee token information */
    crossChainFeeTokenAddress: string
}

/** Represents DEX Router information */
export interface SubRouter {
    /** The information of a token to be sold */
    fromToken: SwapToken
    /** The information of a token to be bought */
    toToken: SwapToken
    dexProtocol: DexProtocol[]
}

/** Represents a DEX router with sub-routers */
type DexRouter = {
    /** One of the main paths for the token swap */
    router: string
    /** The percentage of assets handled by the protocol */
    routerPercent: string
    /** DEX Router information */
    subRouterList: SubRouter[]
}

/** Represents an item in the router list */
export type RouterListItem = {
    /** The recommended gas limit for calling the contract */
    estimateGasFee: string
    /** time in seconds (It's wrongly wrote as estimatedTime) */
    estimateTime: string
    fromChainNetworkFee: string
    minimumReceived: string
    needApprove: number
    /** Bridge information */
    router: Router
    /** Source chain swap information */
    fromDexRouterList: DexRouter[]
    toChainNetworkFee: string
    /** Destination chain's swap route information */
    toDexRouterList: DexRouter[]
    toTokenAmount: string
}
export interface OKXBridgeQuote {
    /**
     * Destination chain ID (e.g., 1 for Ethereum)
     * API response string, we convert to number
     */
    fromChainId: number
    /**
     * Destination chain ID (e.g., 1 for Ethereum)
     * API response string, we convert to number
     */
    toChainId: number
    /** The input amount of a token to be sold */
    fromTokenAmount: string
    /** The information of a token to be sold */
    fromToken: SwapToken
    /** The information of a token to be bought */
    toToken: SwapToken
    /** Quote path data set */
    routerList: RouterListItem[]
    /** The resulting amount of a token to be bought */
    toTokenAmount: string
}
/** Response type for getting a cross-chain quote */
export type GetBridgeQuoteResponse = OKXResponse<OKXBridgeQuote[]>

export interface BridgeOptions {
    /** Source chain ID (e.g., `1` for Ethereum) */
    fromChainId: ChainId

    /** Destination chain ID (e.g., `1` for Ethereum) */
    toChainId: ChainId

    /** The contract address of a token to be sold */
    fromTokenAddress: string

    /** The contract address of a token to be bought */
    toTokenAddress: string

    /** The input amount of a token to be sold (set in minimal divisible units) */
    amount: string

    /**
     * Cross-chain swap routes
     * 0: default route (most tokens)
     * 1: optimal route (considering fees, slippage, etc.)
     * 2: quickest route
     */
    sort?: 0 | 1 | 2

    /**
     * The slippage you are willing to accept (e.g., `0.5` for 50% slippage)
     * Min: 0.002, Max: 0.5
     */
    slippage: string

    /** User's wallet address (AA wallet address not supported) */
    userWalletAddress: string

    /** Specify bridges that should be included in routes */
    allowBridge?: number[]

    /** Specify bridges that should be excluded in routes */
    denyBridge?: number[]

    /**
     * Receive address of a bought token
     * If not set, the `userWalletAddress` will receive the bought token
     */
    receiveAddress?: string

    /**
     * The percentage of fromTokenAmount to be sent to the referrer's address
     * Min: 0, Max: 3
     */
    feePercent?: string

    /** Referrer address that receives the referrer fee */
    referrerAddress?: string

    /**
     * The percentage (between 0 - 1.0) of the price impact allowed
     * Default: 0.9 (90%)
     */
    priceImpactProtectionPercentage?: string

    /**
     * If true, cross-chain transactions are executed directly through the bridge,
     * without making a source-chain swap or a destination-chain swap
     */
    onlyBridge?: boolean

    /**
     * Custom parameters carried in /build-tx (128-character 64-byte hexadecimal string)
     */
    memo?: string
}

/** Represents bridge information */
type BridgeRouter = {
    /** Bridge ID (e.g., 211) */
    bridgeId: number
    /** Name of bridge (e.g., cBridge) */
    bridgeName: string
    /** Native token fee for certain cross-chain bridges */
    otherNativeFee: string
    /** The cross-chain bridge fee charged by the bridge, usually in stablecoin or WETH */
    crossChainFee: string
    /** The cross-chain bridge fee token information */
    crossChainFeeTokenAddress: string
}

/** Represents on-chain transaction data */
type Transaction = {
    /** InputData on chain */
    data: string
    /** User's wallet address (e.g., 0x6f9ffea7370310cd0f890dfde5e0e061059dcfd9) */
    from: string
    /** The referrer's address (e.g., 0x6dc1fb08decf9f95a01222baa359aa0e02e07716) */
    to: string
    /** The amount of native tokens (in wei) that will be sent to the contract address (e.g., 0) */
    value: string
    /** (Optional) The gas (in wei) for the swap transaction. If the value is too low to achieve the quote, an error will be returned (e.g., 50000) */
    gasLimit?: string
    /** Gas price in wei (e.g., 110000000) */
    gasPrice: string
    /** EIP-1559: Recommended priority cost of gas per unit (e.g., 500000000) */
    maxPriorityFeePerGas: string
    randomKeyAccount: any[]
}

// cspell:ignore minmum
/** Response type for getting a cross-chain swap */
export type GetBridgeResponse = OKXResponse<
    Array<{
        /** The input amount of a token to be sold (Quantity needs to include accuracy. e.g., 1.00 USDT set as 1000000) */
        fromTokenAmount: string
        /** The resulting amount of a token to be bought (Quantity needs to include accuracy. e.g., 1.00 USDT set as 1000000) */
        toTokenAmount: string
        /** The minimum amount of a token to buy when the price reaches maximum slippage */
        minmumReceive: string
        /** Bridge information */
        router: BridgeRouter
        /** On chain transaction data */
        tx: Transaction
        /**
         * The randomKeyAccount parameter is not required for every transaction.
         * It is only generated and returned during certain special transactions,
         * such as when using the CCTP bridge for cross-chain token transfers.
         */
        randomKeyAccount?: string[]
    }>
>

export interface GetBridgeStatusOptions {
    chainId?: number
    hash: string
}

export interface BridgeStatus {
    bridgeHash: string
    crossChainFee: {
        symbol: string
        address: string
        amount: string
    } | null
    crossChainInfo: {
        memo?: string
    } | null
    destinationChainGasfee: string
    /**
     * WAITING (Order processing)
     * FROM_SUCCESS (Source swap success)
     * FROM_FAILURE (Source swap failure)
     * BRIDGE_PENDING (Bridge pending)
     * BRIDGE_SUCCESS (Bridge success)
     * SUCCESS (Order success)
     * REFUND (Order failure, refund)
     */
    detailStatus: 'WAITING' | 'FROM_SUCCESS' | 'FROM_FAILURE' | 'BRIDGE_PENDING' | 'SUCCESS' | 'REFUND'
    errorMsg: string
    fromAmount: string
    /** API response string, we convert to number */
    fromChainId: number
    fromTokenAddress: string
    fromTxHash: string
    refundTokenAddress: string
    sourceChainGasfee: string
    /**
     * PENDING (Order pending)
     * SUCCESS (Order success)
     * FAILURE (Order failure)
     */
    status: 'PENDING' | 'SUCCESS' | 'FAILURE'
    toAmount: string
    /** API response string(could be empty string), we convert to number */
    toChainId: number
    toTokenAddress: string
    toTxHash: string
}

export type GetBridgeStatusResponse = OKXResponse<BridgeStatus[]>
