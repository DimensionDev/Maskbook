import { PluginID } from '@masknet/shared-base'

// Note: if the latest version has been changed, please update packages/mask/src/components/CompositionDialog/useSubmit.ts
/**
 * !! Change this key cause a breaking change in the red packet plugin.
 * !! Please make sure it also be able to recognize the old key.
 */
export const RedPacketMetaKey = `${PluginID.RedPacket}:1`
export const RedPacketNftMetaKey = `${PluginID.RedPacket}_nft:1`
/**
 * !! This ID is used to identify the stored plugin data. Change it will cause data lost.
 */
export const RedPacketPluginID = PluginID.RedPacket

export const RED_PACKET_DEFAULT_SHARES = 5
export const RED_PACKET_MIN_SHARES = 1
export const RED_PACKET_MAX_SHARES = 255
