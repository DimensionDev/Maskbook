import { Router } from '@uniswap/v2-sdk'
import { TradeProvider } from '@masknet/public-api'

// Pangolin and TraderJoe have modified uniswap contracts
type SwapParams = Parameters<typeof Router.swapCallParameters>

export function swapCallParameters(trade: SwapParams[0], options: SwapParams[1], tradeProvider?: TradeProvider) {
    const parameters = Router.swapCallParameters(trade, options)
    if (tradeProvider === TradeProvider.PANGOLIN || tradeProvider === TradeProvider.TRADERJOE) {
        switch (parameters.methodName) {
            case 'WETH':
                parameters.methodName = 'WAVAX'
                break
            case 'swapTokensForExactETH':
                parameters.methodName = 'swapTokensForExactAVAX'
                break
            case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
                /* cspell:disable-next-line */
                parameters.methodName = 'swapExactTokensForAVAXSupportingFeeOnTransferTokens'
                break
            case 'swapExactTokensForETH':
                parameters.methodName = 'swapExactTokensForAVAX'
                break
            case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
                /* cspell:disable-next-line */
                parameters.methodName = 'swapExactAVAXForTokensSupportingFeeOnTransferTokens'
                break
            case 'swapExactETHForTokens':
                parameters.methodName = 'swapExactAVAXForTokens'
                break
        }
    }
    return parameters
}
