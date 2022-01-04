import { PluginId } from '@masknet/plugin-infra'

/**
 * !! Change this key cause a breaking change in the red packet plugin.
 * !! Please make sure it also be able to recognize the old key.
 */
export const RedPacketMetaKey = `${PluginId.RedPacket}:1`
export const RedPacketNftMetaKey = `${PluginId.RedPacket}_nft:1`
/**
 * !! This ID is used to identify the stored plugin data. Change it will cause data lost.
 */
export const RedPacketPluginID = PluginId.RedPacket

export const RED_PACKET_DEFAULT_SHARES = 5
export const RED_PACKET_MIN_SHARES = 1
export const RED_PACKET_MAX_SHARES = 999
export const NFT_RED_PACKET_MAX_SHARES = 255
