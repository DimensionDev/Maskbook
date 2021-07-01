import type { Plugin } from '@masknet/plugin-infra'
import { EthereumTokenType, formatBalance, getChainDetailed, getChainIdFromName } from '@masknet/web3-shared'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { base } from '../base'
import { RedPacketMetaKey } from '../constants'
import { RedPacketMetadataReader, renderWithRedPacketMetadata } from './helpers'
import type { RedPacketJSONPayload } from '../types'
import RedPacketDialog from './RedPacketDialog'
import { RedPacketInPost } from './RedPacketInPost'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        if (!RedPacketMetadataReader(props.message.meta).ok) return null
        return (
            <MaskbookPluginWrapper pluginName="Red Packet">
                {renderWithRedPacketMetadata(props.message.meta, (r) => (
                    <RedPacketInPost payload={r} />
                ))}
            </MaskbookPluginWrapper>
        )
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [
            RedPacketMetaKey,
            (payload: RedPacketJSONPayload) => {
                const chainId = getChainIdFromName(payload.network ?? 'ETH')
                const chainDetailed = getChainDetailed(chainId)
                const tokenDetailed =
                    payload.token_type === EthereumTokenType.Native ? chainDetailed?.nativeCurrency : payload.token
                return `A Red Packet with ${formatBalance(payload.total, tokenDetailed?.decimals ?? 0)} $${
                    tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'
                } from ${payload.sender.name}`
            },
        ],
    ]),
    CompositionDialogEntry: {
        dialog: RedPacketDialog,
        label: { fallback: '💰 Red Packet' },
    },
}

export default sns
