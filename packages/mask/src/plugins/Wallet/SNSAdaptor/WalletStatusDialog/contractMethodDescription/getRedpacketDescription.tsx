import {
    getRedPacketConstants,
    isSameAddress,
    useERC20TokenDetailed,
    formatBalance,
    isNativeTokenAddress,
    useNativeTokenDetailed,
    ERC20TokenDetailed,
    NativeTokenDetailed,
} from '@masknet/web3-shared-evm'
import { useI18N } from '../../../../../utils'
import type { ContractMethodInfo, ComputedPayload } from '../type'

export function getRedpacketDescription(
    { name, address, chainId }: ContractMethodInfo,
    computedPayload: ComputedPayload,
) {
    const { HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)

    if (!isSameAddress(address, HAPPY_RED_PACKET_ADDRESS_V4)) return undefined

    switch (name) {
        case 'create_red_packet':
            return (
                <CreateRedpacketDescription
                    tokenAddress={computedPayload?.parameters?._token_addr ?? ''}
                    tokenAmount={computedPayload?.parameters?._total_tokens}
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

    let token: ERC20TokenDetailed | NativeTokenDetailed | undefined
    const { t } = useI18N()
    const { value: nativeToken } = useNativeTokenDetailed()

    const { value: tokenDetailed } = useERC20TokenDetailed(tokenAddress)
    token = isNativeTokenAddress(tokenAddress) ? nativeToken : tokenDetailed

    return (
        <span>
            {token && tokenAddress
                ? t('plugin_red_packet_create_with_token', {
                      symbol: `${formatBalance(tokenAmount, token.decimals)} ${token.symbol}`,
                  })
                : t('plugin_red_packet_create')}
        </span>
    )
}
