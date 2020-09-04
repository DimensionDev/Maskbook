import type { PluginConfig } from '../plugin'
import RedPacketInDecryptedPost from './UI/RedPacketInDecryptedPost'
import React from 'react'
import { formatBalance } from '../Wallet/formatter'
import BigNumber from 'bignumber.js'
import { RedPacketMetadataReader } from '../RedPacket/utils'
import { RedPacketMetaKey, RedPacketPluginID } from './constants'
import type { RedPacketJSONPayload } from './types'

export const RedPacketPluginDefine: PluginConfig = {
    pluginName: 'Red Packet',
    identifier: RedPacketPluginID,
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
