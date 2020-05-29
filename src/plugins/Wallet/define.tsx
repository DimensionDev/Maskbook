import type { PluginConfig } from '../plugin'
import { readTypedMessageMetadata } from '../../extension/background-script/CryptoServices/utils'
import RedPacketInDecryptedPost from './UI/RedPacket/RedPacketInDecryptedPost'
import { RedPacketMetaKey } from './RedPacketMetaKey'

export const RedPacketPluginDefine: PluginConfig = {
    identifier: 'com.maskbook.redpacket',
    shouldActivateInPostInspector: () => false,
    shouldActivateInSuccessDecryption: (props) => readTypedMessageMetadata(props.meta, RedPacketMetaKey).ok,
    PostInspectorComponent: () => null,
    SuccessDecryptionComponent: RedPacketInDecryptedPost,
}
