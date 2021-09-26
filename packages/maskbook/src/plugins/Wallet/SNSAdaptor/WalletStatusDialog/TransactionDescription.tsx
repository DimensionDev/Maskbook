import type { TransactionReceipt } from 'web3-core'
import {
    useNativeTokenDetailed,
    useERC20TokenDetailed,
    EthereumRpcType,
    formatBalance,
    NativeTokenDetailed,
    ERC20TokenDetailed,
    FungibleTokenDetailed,
    pow10,
} from '@masknet/web3-shared'
import type Services from '../../../../extension/service'

function getTokenAmountDescription(amount = '0', tokenDetailed?: FungibleTokenDetailed, negative?: boolean) {
    return `${negative ? '-' : ''}${
        pow10(9 + (tokenDetailed?.decimals ?? 18)).isGreaterThanOrEqualTo(amount)
            ? formatBalance(amount, tokenDetailed?.decimals ?? 0, 4)
            : 'infinite'
    } ${tokenDetailed?.symbol}`.trim()
}

function getTransactionDescription(
    nativeTokenDetailed?: NativeTokenDetailed,
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
                default:
                    return `Contract Interaction ${
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
    const { loading: getERC20TokenLoading, value: tokenDetailed } = useERC20TokenDetailed(
        computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION &&
            ['approve', 'transfer', 'transferForm'].includes(computedPayload.name ?? '')
            ? computedPayload._tx.to
            : '',
    )

    return !getNativeTokenLoading && !getERC20TokenLoading ? (
        <span>{getTransactionDescription(nativeTokenDetailed, tokenDetailed, computedPayload) ?? hash}</span>
    ) : null
}
