import type { Plugin } from '@masknet/plugin-infra'
import { ChainId, EthereumTokenType, formatBalance, getChainDetailed, getChainIdFromName } from '@masknet/web3-shared'
import MaskbookPluginWrapper from '../../MaskbookPluginWrapper'
import { base } from '../base'
import { RedPacketMetaKey, RedPacketNftMetaKey } from '../constants'
import {
    RedPacketMetadataReader,
    RedPacketNftMetadataReader,
    renderWithRedPacketMetadata,
    renderWithRedPacketNftMetadata,
} from './helpers'
import type { RedPacketJSONPayload, RedPacketNftJSONPayload } from '../types'
import RedPacketDialog from './RedPacketDialog'
import { RedPacketInPost } from './RedPacketInPost'
import { RedPacketNftInPost } from './RedPacketNftInPost'
import { ToolIconURLs } from '../../../resources/tool-icon'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector(props) {
        if (RedPacketMetadataReader(props.message.meta).ok)
            return (
                <MaskbookPluginWrapper pluginName="Red Packet">
                    {renderWithRedPacketMetadata(props.message.meta, (r) => (
                        <RedPacketInPost payload={r} />
                    ))}
                </MaskbookPluginWrapper>
            )

        if (RedPacketNftMetadataReader(props.message.meta).ok)
            return (
                <MaskbookPluginWrapper pluginName="Red Packet NFT">
                    {renderWithRedPacketNftMetadata(props.message.meta, (r) => (
                        <RedPacketNftInPost payload={r} />
                    ))}
                </MaskbookPluginWrapper>
            )
        return null
    },
    CompositionDialogMetadataBadgeRender: new Map([
        [
            RedPacketMetaKey,
            (payload: RedPacketJSONPayload) => {
                const chainId = getChainIdFromName(payload.network ?? '') ?? ChainId.Mainnet
                const chainDetailed = getChainDetailed(chainId)
                const tokenDetailed =
                    payload.token_type === EthereumTokenType.Native ? chainDetailed?.nativeCurrency : payload.token
                return `A Red Packet with ${formatBalance(payload.total, tokenDetailed?.decimals ?? 0)} $${
                    tokenDetailed?.symbol ?? tokenDetailed?.name ?? 'Token'
                } from ${payload.sender.name}`
            },
        ],
        [
            RedPacketNftMetaKey,
            (_payload: RedPacketNftJSONPayload) => {
                return 'A Red Packet with NFT'
            },
        ],
    ]),
    CompositionDialogEntry: {
        dialog: RedPacketDialog,
        label: { fallback: '💰 Red Packet' },
    },
    ToolbarEntry: {
        ...ToolIconURLs.redpacket,
        onClick: 'openCompositionEntry',
    },
}

export default sns
