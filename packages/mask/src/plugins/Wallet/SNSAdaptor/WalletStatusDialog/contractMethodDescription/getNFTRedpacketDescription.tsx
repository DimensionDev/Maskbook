import { getNftRedPacketConstants, isSameAddress } from '@masknet/web3-shared-evm'
import { i18n } from '../../../../../../shared-ui/locales_legacy'
import type { ComputedPayload } from '../../../../../extension/background-script/EthereumServices/rpc'
import type { ContractMethodInfo } from '../type'

export function getNFTRedpacketDescription(
    { name, address, chainId }: ContractMethodInfo,
    computedPayload: ComputedPayload,
) {
    const { RED_PACKET_NFT_ADDRESS } = getNftRedPacketConstants(chainId)

    if (!isSameAddress(address, RED_PACKET_NFT_ADDRESS)) return undefined

    switch (name) {
        case 'create_red_packet':
            return i18n.t('plugin_nft_red_packet_create')
        default:
            return undefined
    }
}
