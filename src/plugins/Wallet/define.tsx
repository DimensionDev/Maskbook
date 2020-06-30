import type { PluginConfig } from '../plugin'
import { readTypedMessageMetadata } from '../../extension/background-script/CryptoServices/utils'
import RedPacketInDecryptedPost from './UI/RedPacket/RedPacketInDecryptedPost'
import { RedPacketMetaKey } from './RedPacketMetaKey'
import React from 'react'
import type { RedPacketMetadata } from './database/types'
import { formatBalance } from './formatter'
import BigNumber from 'bignumber.js'

export const RedPacketPluginDefine: PluginConfig = {
    pluginName: 'Red Packet',
    identifier: 'com.maskbook.redpacket',
    successDecryptionInspector: function Comp(props) {
        if (!readTypedMessageMetadata(props.message.meta, RedPacketMetaKey).ok) return null
        return <RedPacketInDecryptedPost {...props} />
    },
    postDialogMetadataBadge: new Map([
        [
            RedPacketMetaKey,
            (payload: RedPacketMetadata) => {
                return `A Red Packet with ${formatBalance(
                    new BigNumber(payload.total),
                    payload.token?.decimals ?? 18,
                )} $${payload.token?.name || 'ETH'} from ${payload.sender.name}`
            },
        ],
    ]),
}
