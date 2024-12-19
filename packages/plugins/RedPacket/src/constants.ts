import { PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

// Note: if the latest version has been changed, please update packages/mask/content-script/components/CompositionDialog/useSubmit.ts
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

export const enum RoutePaths {
    Create = '/create',
    CreateErc20RedPacket = '/create/erc20',
    CreateNftRedPacket = '/create/nft',
    Confirm = '/confirm',
    ConfirmErc20RedPacket = '/confirm/erc20',
    ConfirmNftRedPacket = '/confirm/nft',
    CustomCover = '/custom-cover',
    Requirements = '/requirements',
    SelectNft = '/select-nft',

    History = '/history',
    HistoryDetail = '/history/detail',
    SentHistory = '/history/sent',
    ClaimedHistory = '/history/claimed',
    NftHistory = '/nft-history',

    Exit = '/exit',
    Terms = '/terms',
}

export const MAX_FILE_SIZE = 1 * 1024 * 1024
export const DURATION = 60 * 60 * 24

export const nftDefaultChains = [ChainId.Mainnet, ChainId.BSC, ChainId.Polygon]
