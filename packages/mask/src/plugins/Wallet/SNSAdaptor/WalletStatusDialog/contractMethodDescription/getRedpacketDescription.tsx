import {
    getRedPacketConstants,
    isSameAddress,
    useERC20TokenDetailed,
    formatBalance,
    isNativeTokenAddress,
    useNativeTokenDetailed,
} from '@masknet/web3-shared-evm'
import type { ComputedPayload } from '../../../../../extension/background-script/EthereumServices/rpc'
import { useI18N } from '../../../../../utils'
import type { ContractMethodInfo } from '../type'

export function getRedpacketDescription(
    { name, address, chainId }: ContractMethodInfo,
    computedPayload: ComputedPayload,
) {
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)

    if (!isSameAddress(address, HAPPY_RED_PACKET_ADDRESS_V4)) return undefined

    const transactionComputedPayloadParams =
        (computedPayload && 'parameters' in computedPayload && computedPayload.parameters) || undefined

    switch (name) {
        case 'create_red_packet':
            return (
                <CreateRedpacketDescription
                    tokenAddress={transactionComputedPayloadParams?._token_addr ?? ''}
                    tokenAmount={transactionComputedPayloadParams?._total_tokens!}
                />
            )
        default:
            return undefined
    }
}

interface CreateRedpacketDescriptionProps {
    tokenAddress: string
    tokenAmount: string
}

export function CreateRedpacketDescription(props: CreateRedpacketDescriptionProps) {
    const { tokenAddress, tokenAmount } = props
    const { t } = useI18N()

    const { value: nativeToken } = useNativeTokenDetailed()
    const { value: tokenDetailed } = useERC20TokenDetailed(tokenAddress)
    const token = isNativeTokenAddress(tokenAddress) ? nativeToken : tokenDetailed

    return (
        <span>
            {token && tokenAddress
                ? t('plugin_red_packet_create_with_token', {
                      amount: formatBalance(tokenAmount, token.decimals),
                      symbol: token.symbol,
                  })
                : t('plugin_red_packet_create')}
        </span>
    )
}
