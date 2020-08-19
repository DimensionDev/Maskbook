import type { PluginConfig } from '../plugin'
import RedPacketInDecryptedPost from './UI/RedPacket/RedPacketInDecryptedPost'
import React from 'react'
import { formatBalance } from './formatter'
import BigNumber from 'bignumber.js'
import { RedPacketMetadataReader, RedPacketMetaKey, RedPacketJSONPayload } from '../RedPacket/utils'

export const RedPacketPluginDefine: PluginConfig = {
    pluginName: 'Red Packet',
    identifier: 'com.maskbook.redpacket',
    successDecryptionInspector: function Comp(props) {
        if (!RedPacketMetadataReader(props.message.meta).ok) return null
        return <RedPacketInDecryptedPost {...props} />
    },
    postDialogMetadataBadge: new Map([
        [
            RedPacketMetaKey,
            (payload: RedPacketJSONPayload) => {
                return `A Red Packet with ${formatBalance(
                    new BigNumber(payload.total),
                    payload.token?.decimals ?? 18,
                )} $${payload.token?.name || 'ETH'} from ${payload.sender.name}`
            },
        ],
    ]),
}
