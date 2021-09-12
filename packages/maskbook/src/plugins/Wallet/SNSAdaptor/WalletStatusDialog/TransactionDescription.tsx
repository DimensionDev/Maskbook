import type { TransactionReceipt } from 'web3-core'
import {
    useNativeTokenDetailed,
    useERC20TokenDetailed,
    EthereumRpcType,
    formatBalance,
    NativeTokenDetailed,
    ERC20TokenDetailed,
} from '@masknet/web3-shared'
import type Services from '../../../../extension/service'

function getDescription(
    nativeTokenDetailed?: NativeTokenDetailed,
    tokenDetailed?: ERC20TokenDetailed,
    receipt?: TransactionReceipt | null,
    computedPayload?: UnboxPromise<ReturnType<typeof Services.Ethereum.getSendTransactionComputedPayload>> | null,
) {
    if (!computedPayload) return receipt?.transactionHash
    const type = computedPayload.type
    const deductedValue = formatBalance(
        (computedPayload._tx.value as string | undefined) ?? '0',
        nativeTokenDetailed?.decimals ?? 0,
    )
    switch (type) {
        case EthereumRpcType.SEND_ETHER:
            return `Send token -${deductedValue} ${nativeTokenDetailed?.symbol}`
        case EthereumRpcType.CONTRACT_INTERACTION:
            const deductedTokenValue = formatBalance(computedPayload.parameters?.value, tokenDetailed?.decimals ?? 0)
            switch (computedPayload.name) {
                case 'approve':
                    return `Approve spend limit ${deductedTokenValue} ${tokenDetailed?.symbol}`
                case 'transfer':
                case 'transferFrom':
                    return `Transfer token -${deductedTokenValue} ${tokenDetailed?.symbol}`
                default:
                    return `Contract Interaction -${deductedValue} ${nativeTokenDetailed?.symbol}`
            }
        case EthereumRpcType.CONTRACT_DEPLOYMENT:
            return `Contract Deployment -${deductedValue} ${nativeTokenDetailed?.symbol}`
        case EthereumRpcType.CANCEL:
            return 'Cancel Transaction'
        case EthereumRpcType.RETRY:
            return 'Retry Transaction'
        default:
            return receipt?.transactionHash
    }
}

export interface RecentTransactionDescriptionProps {
    receipt?: TransactionReceipt | null
    computedPayload?: UnboxPromise<ReturnType<typeof Services.Ethereum.getSendTransactionComputedPayload>> | null
}

export function RecentTransactionDescription(props: RecentTransactionDescriptionProps) {
    const { receipt, computedPayload } = props
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    const { value: tokenDetailed } = useERC20TokenDetailed(
        computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION ? computedPayload._tx.to : '',
    )

    return <span>{getDescription(nativeTokenDetailed, tokenDetailed, receipt, computedPayload)}</span>
}
