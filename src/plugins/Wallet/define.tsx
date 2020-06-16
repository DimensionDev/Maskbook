import type { PluginConfig } from '../plugin'
import { readTypedMessageMetadata } from '../../extension/background-script/CryptoServices/utils'
import RedPacketInDecryptedPost from './UI/RedPacket/RedPacketInDecryptedPost'
import { RedPacketMetaKey } from './RedPacketMetaKey'
import React from 'react'

export const RedPacketPluginDefine: PluginConfig = {
    identifier: 'com.maskbook.redpacket',
    successDecryptionInspector: function Comp(props) {
        if (!readTypedMessageMetadata(props.message.meta, RedPacketMetaKey).ok) return null
        return <RedPacketInDecryptedPost {...props} />
    },
}
