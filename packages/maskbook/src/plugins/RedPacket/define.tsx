import { formatBalance } from '@dimensiondev/maskbook-shared'
import { EthereumTokenType, getChainDetailed, getChainIdFromName } from '@dimensiondev/web3-shared'
import { PluginConfig, PluginStage, PluginScope } from '../types'
import { RedPacketInspector } from './UI/RedPacketInspector'
import { RedPacketMetadataReader } from './helpers'
import { RedPacketMetaKey, RedPacketPluginID } from './constants'
import type { RedPacketJSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import RedPacketDialog from './UI/RedPacketDialog'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'

export const [RedPacketCompositionEntry, RedPacketCompositionUI] = createCompositionDialog('💰 Red Packet', (props) => (
    <RedPacketDialog open={props.open} onConfirm={props.onClose} onClose={props.onClose} />
))
export const RedPacketPluginDefine: PluginConfig = {
    id: RedPacketPluginID,
    pluginIcon: '🧧',
    pluginName: 'Red Packet',
    pluginDescription:
        'Red Packet is a special feature in Mask Network which was launched in early 2020. Once users have installed the Chrome/ Firefox plugin, they can claim and give out cryptocurrencies on Twitter.',
    identifier: RedPacketPluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    successDecryptionInspector: function Comp(props) {
        if (!RedPacketMetadataReader(props.message.meta).ok) return null
        return (
            <MaskbookPluginWrapper pluginName="Red Packet">
                <RedPacketInspector {...props} />
            </MaskbookPluginWrapper>
        )
    },
    postDialogMetadataBadge: new Map([
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
    PageComponent: RedPacketCompositionUI,
    postDialogEntries: [RedPacketCompositionEntry],
}
