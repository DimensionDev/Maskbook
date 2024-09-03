/** https://www.okx.com/web3/build/docs/waas/okx-waas-standard */
type OKXResponse<T> =
    | {
          code: 0
          msg: 'success'
          data: T
      }
    | {
          code: 1
          msg: string
      }

export type SupportedChainResponse = OKXResponse<
    Array<{
        chainId: string
        chainName: string
        /** would be empty string for non-ethereum chains */
        dexTokenApproveAddress: string
    }>
>

export type GetTokensResponse = OKXResponse<
    Array<{
        /** @example "18" */
        decimals: string
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

export type GetLiquidityResponse = OKXResponse<{
    /** @example "1" */
    id: string
    /** @example "Uniswap V2" */
    name: string
}>

export type ApproveTransactionResponse = OKXResponse<{
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

export interface OKXSwapQuote {
    chainId: string
    dexRouterList: Array<{
        router: string
        /** @example "100" */
        routerPercent: string
        subRouterList: Array<{
            /** @example "Uniswap V3" */
            dexName: string
            /** @example "100" */
            percent: string
        }>
        fromToken: {
            /** @example "18" */
            decimal: string
            /** @example "0x382bb369d343125bfb2117af9c149795c6c65c50" */
            tokenContractAddress: string
            /** @example "USDC" */
            tokenSymbol: string
            /** @example "0.9998542668416743" */
            tokenUnitPrice: string
        }
        toToken: {
            /** @example "18" */
            decimal: string
            /** @example "0x382bb369d343125bfb2117af9c149795c6c65c50" */
            tokenContractAddress: string
            /** @example "USDC" */
            tokenSymbol: string
            /** @example "0.9998542668416743" */
            tokenUnitPrice: string
        }
    }>
    /** Gas fee estimate */
    estimateGasFee: string
    fromToken: {
        /** @example "18" */
        decimal: string
        /** @example "0x382bb369d343125bfb2117af9c149795c6c65c50" */
        tokenContractAddress: string
        /** @example "USDC" */
        tokenSymbol: string
        /** @example "0.9998542668416743" */
        tokenUnitPrice: string
    }
    /** Amount of fromToken */
    fromTokenAmount: string
    quoteCompareList: Array<{
        amountOut: string
        dexLogo: string
        dexName: string
        tradeFee: string
    }>
    toToken: {
        /** @example "18" */
        decimal: string
        /** @example "0x382bb369d343125bfb2117af9c149795c6c65c50" */
        tokenContractAddress: string
        /** @example "USDC" */
        tokenSymbol: string
        /** @example "0.9998542668416743" */
        tokenUnitPrice: string
    }
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

export type SwapResponse = {
    code: string
    data: Array<{
        routerResult: {
            chainId: string
            /** the input amount of a token to be sold */
            fromTokenAmount: string
            /** the output amount of a token to be received */
            toTokenAmount: string
            /** Gas fee estimate */
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
                    dexProtocol: Array<{
                        /** @example "Uniswap V3" */
                        dexName: string
                        percent: string
                    }>
                    fromToken: {
                        tokenContractAddress: string
                        tokenSymbol: string
                        tokenUnitPrice: string
                        decimal: string
                    }
                    toToken: {
                        tokenContractAddress: string
                        tokenSymbol: string
                        tokenUnitPrice: string
                        decimal: string
                    }
                }>
            }>
            fromToken: {
                tokenContractAddress: string
                tokenSymbol: string
                tokenUnitPrice: string
                decimal: string
            }
            toToken: {
                tokenContractAddress: string
                tokenSymbol: string
                tokenUnitPrice: string
                decimal: string
            }
            quoteCompareList: Array<{
                dexName: string
                dexLogo: string
                tradeFee: string
                receiveAmount: string
            }>
        }
        tx: {
            from: string
            gas: string
            gasPrice: string
            maxPriorityFeePerGas: string
            to: string
            value: string
            minReceiveAmount: string
            data: string
        }
    }>
    msg: string
}
