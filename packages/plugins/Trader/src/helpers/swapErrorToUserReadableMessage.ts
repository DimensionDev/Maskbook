export function swapErrorToUserReadableMessage(error: any): string {
    let reason: string | undefined
    while (error) {
        reason = error.reason ?? error.message ?? reason
        error = error.error ?? error.data?.originalError
    }

    if (reason?.startsWith('execution reverted: ')) reason = reason.slice('execution reverted: '.length)

    switch (reason) {
        case 'UniswapV2Router: EXPIRED':
            return 'The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.'
        case 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT':
        case 'UniswapV2Router: EXCESSIVE_INPUT_AMOUNT':
            return 'This transaction will not succeed either due to price movement or fee on transfer.'
        case 'TransferHelper: TRANSFER_FROM_FAILED':
            return 'The input token cannot be transferred. There may be an issue with the input token.'
        case 'UniswapV2: TRANSFER_FAILED':
            return 'The output token cannot be transferred. There may be an issue with the output token.'
        case 'UniswapV2: K':
            return 'The Uniswap invariant x*y=k was not satisfied by the swap. This usually means one of the tokens you are swapping incorporates custom behavior on transfer.'
        case 'Too little received':
        case 'Too much requested':
        case 'STF':
            return 'This transaction will not succeed due to price movement.'
        case 'TF':
            return 'The output token cannot be transferred. There may be an issue with the output token.'
        default:
            if (reason?.includes('undefined is not an object')) {
                console.error(error, reason)
                return 'An error occurred when trying to execute this swap. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading.'
            }
            return `Unknown error${reason ? `: "${reason}"` : ''}.`
    }
}
