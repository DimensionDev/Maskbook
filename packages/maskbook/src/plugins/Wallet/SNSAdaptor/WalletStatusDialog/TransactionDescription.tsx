import type { TransactionReceipt } from 'web3-core'
import {
    useNativeTokenDetailed,
    useERC20TokenDetailed,
    EthereumRpcType,
    formatBalance,
    NativeTokenDetailed,
    ERC20TokenDetailed,
    FungibleTokenDetailed,
} from '@masknet/web3-shared'
import type Services from '../../../../extension/service'

function getTokenAmountDescription(amount?: string, tokenDetailed?: FungibleTokenDetailed, negative?: boolean) {
    return `${negative ? '-' : ''}${formatBalance(amount ?? '0', tokenDetailed?.decimals ?? 0, 4)} ${
        tokenDetailed?.symbol
    }`.trim()
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
            if (!tokenDetailed) return ''
            const deductedTokenValue = formatBalance(computedPayload.parameters?.value, tokenDetailed?.decimals ?? 0)

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
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const { value: tokenDetailed } = useERC20TokenDetailed(
        computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION &&
            ['approve', 'transfer', 'transferForm'].includes(computedPayload.name ?? '')
            ? computedPayload._tx.to
            : '',
    )

    return <span>{getTransactionDescription(nativeTokenDetailed, tokenDetailed, computedPayload) ?? hash}</span>
}
