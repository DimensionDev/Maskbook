import type { TransactionReceipt } from 'web3-core'
import {
    useNativeTokenDetailed,
    EthereumRpcType,
    formatBalance,
    NativeTokenDetailed,
    ERC20TokenDetailed,
    FungibleTokenDetailed,
    pow10,
    useERC20TokenDetailed,
} from '@masknet/web3-shared-evm'
import type Services from '../../../../extension/service'
import { first, last } from 'lodash-unified'

function getTokenAmountDescription(amount = '0', tokenDetailed?: FungibleTokenDetailed, negative?: boolean) {
    return `${negative ? '- ' : ''}${
        pow10(9 + (tokenDetailed?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
            ? formatBalance(amount, tokenDetailed?.decimals ?? 0, 4)
            : 'infinite'
    } ${tokenDetailed?.symbol}`.trim()
}

function getTransactionDescription(
    nativeTokenDetailed?: NativeTokenDetailed | ERC20TokenDetailed,
    tokenDetailed?: ERC20TokenDetailed,
    computedPayload?: UnboxPromise<ReturnType<typeof Services.Ethereum.getSendTransactionComputedPayload>> | null,
) {
    if (!computedPayload) return
    const type = computedPayload.type
    console.log(nativeTokenDetailed)
    console.log(computedPayload)
    console.log(tokenDetailed)
    switch (type) {
        case EthereumRpcType.SEND_ETHER:
            return `Send token -${getTokenAmountDescription(
                computedPayload._tx.value as string | undefined,
                nativeTokenDetailed,
            )}`
        case EthereumRpcType.CONTRACT_INTERACTION:
            switch (computedPayload.name) {
                case 'approve':
                    return `Approve spend limit ${getTokenAmountDescription(
                        computedPayload.parameters?.value,
                        tokenDetailed,
                    )}`
                case 'transfer':
                case 'transferFrom':
                    return `Transfer token ${getTokenAmountDescription(
                        computedPayload.parameters?.value,
                        tokenDetailed,
                        true,
                    )}`
                case 'swapExactETHForTokens':
                    const inputAmount = formatBalance(computedPayload._tx.value, nativeTokenDetailed?.decimals, 2)
                    const outputAmount = formatBalance(
                        computedPayload.parameters.amountOutMin,
                        tokenDetailed?.decimals,
                        2,
                    )
                    return `Swap ${inputAmount} ${nativeTokenDetailed?.symbol} for ${outputAmount} ${tokenDetailed?.symbol}`
                case 'swapExactTokensForETH':
                    const inAmount = formatBalance(computedPayload.parameters.amountIn, tokenDetailed?.decimals, 2)
                    const outAmount = formatBalance(
                        computedPayload.parameters.amountOutMin,
                        nativeTokenDetailed?.decimals,
                        2,
                    )
                    return `Swap ${inAmount} ${tokenDetailed?.symbol} for ${outAmount} ${nativeTokenDetailed?.symbol}`
                case 'swapExactTokensForTokens':
                    const amountIn = formatBalance(
                        computedPayload.parameters.amountIn,
                        nativeTokenDetailed?.decimals,
                        2,
                    )
                    const amountOut = formatBalance(
                        computedPayload.parameters.amountOutMin,
                        nativeTokenDetailed?.decimals,
                        2,
                    )
                    return `Swap ${amountIn} ${nativeTokenDetailed?.symbol} for ${amountOut} ${tokenDetailed?.symbol}`
                default:
                    return `${computedPayload.name ?? 'Contract Interaction'} ${
                        computedPayload._tx.value
                            ? getTokenAmountDescription(
                                  computedPayload._tx.value as string | undefined,
                                  nativeTokenDetailed,
                                  true,
                              )
                            : ''
                    }`
            }
        case EthereumRpcType.CONTRACT_DEPLOYMENT:
            return `Contract Deployment ${getTokenAmountDescription(
                computedPayload._tx.value as string | undefined,
                nativeTokenDetailed,
                true,
            )}`
        case EthereumRpcType.CANCEL:
            return 'Cancel Transaction'
        case EthereumRpcType.RETRY:
            return 'Retry Transaction'
        default:
            return
    }
}

export interface RecentTransactionDescriptionProps {
    hash: string
    receipt?: TransactionReceipt | null
    computedPayload?: UnboxPromise<ReturnType<typeof Services.Ethereum.getSendTransactionComputedPayload>> | null
}

export function RecentTransactionDescription(props: RecentTransactionDescriptionProps) {
    const { hash, computedPayload } = props
    const { loading: getNativeTokenLoading, value: nativeTokenDetailed } = useNativeTokenDetailed()
    let inputTokenAddress: string | undefined = ''
    let tokenAddress: string | undefined = ''

    if (computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION) {
        switch (computedPayload.name) {
            case 'approve':
            case 'transfer':
            case 'transferFrom':
                tokenAddress = computedPayload._tx.to
                break
            case 'swapExactETHForTokens':
                tokenAddress = last(computedPayload.parameters.path)
                break
            case 'swapExactTokensForETH':
                tokenAddress = first(computedPayload.parameters.path)
                break
            case 'swapExactTokensForTokens':
                inputTokenAddress = first(computedPayload.parameters.path)
                tokenAddress = last(computedPayload.parameters.path)
                break
            default:
                tokenAddress = ''
        }
    }

    const { loading: getInputERC20TokenLoading, value: inputTokenDetailed } = useERC20TokenDetailed(inputTokenAddress)

    const { loading: getERC20TokenLoading, value: tokenDetailed } = useERC20TokenDetailed(tokenAddress)

    return !getNativeTokenLoading && !getERC20TokenLoading && !getInputERC20TokenLoading ? (
        <span>
            {getTransactionDescription(
                inputTokenAddress ? inputTokenDetailed : nativeTokenDetailed,
                tokenDetailed,
                computedPayload,
            ) ?? hash}
        </span>
    ) : null
}
