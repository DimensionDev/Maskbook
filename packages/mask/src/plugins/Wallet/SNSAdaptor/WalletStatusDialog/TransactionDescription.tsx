import type { TransactionReceipt } from 'web3-core'
import { first, last } from 'lodash-unified'
import {
    ChainId,
    useNativeTokenDetailed,
    EthereumRpcType,
    useChainId,
    formatBalance,
    NativeTokenDetailed,
    ERC20TokenDetailed,
    FungibleTokenDetailed,
    useERC20TokenDetailed,
} from '@masknet/web3-shared-evm'
import { pow10 } from '@masknet/web3-shared-base'
import type Services from '../../../../extension/service'
import { getContractMethodDescription } from './contractMethodDescription'

function getTokenAmountDescription(amount = '0', tokenDetailed?: FungibleTokenDetailed, negative?: boolean) {
    const symbol = negative ? '- ' : ''
    const value = pow10(9 + (tokenDetailed?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
        ? formatBalance(amount, tokenDetailed?.decimals ?? 0, 4)
        : 'infinite'
    const token = tokenDetailed?.symbol?.trim()
    return `${symbol}${value} ${token}`
}

function getTransactionDescription(
    chainId: ChainId,
    nativeTokenDetailed?: NativeTokenDetailed | ERC20TokenDetailed,
    tokenDetailed?: ERC20TokenDetailed,
    computedPayload?: UnboxPromise<ReturnType<typeof Services.Ethereum.getSendTransactionComputedPayload>> | null,
) {
    if (!computedPayload) return
    const type = computedPayload.type

    switch (type) {
        case EthereumRpcType.SEND_ETHER:
            return `Send token -${getTokenAmountDescription(
                computedPayload._tx.value as string | undefined,
                nativeTokenDetailed,
            )}`
        case EthereumRpcType.CONTRACT_INTERACTION:
            switch (computedPayload.name) {
                case 'approve':
                    return `Approve spend ${getTokenAmountDescription(
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
                    const amountOut = formatBalance(computedPayload.parameters.amountOutMin, tokenDetailed?.decimals, 2)
                    return `Swap ${amountIn} ${nativeTokenDetailed?.symbol} for ${amountOut} ${tokenDetailed?.symbol}`
                default:
                    const description = getContractMethodDescription(
                        { name: computedPayload.name ?? '', chainId, address: computedPayload._tx.to ?? '' },
                        computedPayload,
                    )
                    return (
                        description ??
                        `${computedPayload.name ?? 'Contract Interaction'} ${
                            computedPayload._tx.value
                                ? getTokenAmountDescription(
                                      computedPayload._tx.value as string | undefined,
                                      nativeTokenDetailed,
                                      true,
                                  )
                                : ''
                        }`
                    )
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
    const chainId = useChainId()
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
            case 'create_red_packet':
                tokenAddress = computedPayload.parameters._token_addr
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
                chainId,
                inputTokenAddress ? inputTokenDetailed : nativeTokenDetailed,
                tokenDetailed,
                computedPayload,
            ) ?? hash}
        </span>
    ) : null
}
