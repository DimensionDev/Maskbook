import { PluginConfig, PluginStage, PluginScope } from '../types'
import { RedPacketInspector } from './UI/RedPacketInspector'
import { formatBalance } from '@dimensiondev/maskbook-shared'
import { RedPacketMetadataReader } from './helpers'
import { RedPacketMetaKey, RedPacketPluginID } from './constants'
import type { RedPacketJSONPayload } from './types'
import { createCompositionDialog } from '../utils/createCompositionDialog'
import RedPacketDialog from './UI/RedPacketDialog'
import { EthereumTokenType } from '../../web3/types'

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
        return <RedPacketInspector {...props} />
    },
    postDialogMetadataBadge: new Map([
        [
            RedPacketMetaKey,
            (payload: RedPacketJSONPayload) => {
                const decimals = payload.token_type === EthereumTokenType.Ether ? 18 : payload.token?.decimals
                return `A Red Packet with ${formatBalance(payload.total, decimals)} $${
                    payload.token?.name || 'ETH'
                } from ${payload.sender.name}`
            },
        ],
    ]),
    PageComponent: RedPacketCompositionUI,
    postDialogEntries: [RedPacketCompositionEntry],
}
