import { PluginID } from '@masknet/shared-base'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { ChainId } from '@masknet/web3-shared-evm'

/**
 * !! This ID is used to identify the stored plugin data. Change it will cause data lost.
 */
export const RedPacketPluginID = PluginID.RedPacket

export const RED_PACKET_DEFAULT_SHARES = 5
export const RED_PACKET_MIN_SHARES = 1
export const RED_PACKET_MAX_SHARES = 500
export const NFT_RED_PACKET_MAX_SHARES = 255

export const SOL_REDPACKET_MAX_SHARES = 200
export const SOL_REDPACKET_CREATE_DEFAULT_GAS = '10000000'
export const DEFAULT_DURATION = 60 * 60 * 24 // 24 hours
export const enum RoutePaths {
    Create = '/create',
    CreateTokenRedPacket = '/create/token',
    CreateNftRedPacket = '/create/nft',
    Confirm = '/confirm',
    ConfirmTokenRedPacket = '/confirm/token',
    ConfirmNftRedPacket = '/confirm/nft',
    CustomCover = '/custom-cover',
    Requirements = '/requirements',
    SelectCollectibles = '/select-collectibles',

    History = '/history',
    HistoryDetail = '/history/detail',
    SentHistory = '/history/sent',
    ClaimedHistory = '/history/claimed',
    NftHistory = '/nft-history',

    CreateSolanaRedPacket = '/create/solana',
    ConfirmSolanaRedPacket = '/confirm/solana',

    Exit = '/exit',
    Terms = '/terms',
}

export const MAX_FILE_SIZE = 1.5 * 1024 * 1024
export const DURATION = 60 * 60 * 24

export const nftDefaultChains = [ChainId.Mainnet, ChainId.BSC, ChainId.Polygon]

function createTheme(themeId: string, cover: string): FireflyRedPacketAPI.ThemeGroupSettings {
    return {
        tid: themeId,
        cover: {
            title1: {
                color: '#ffffff',
                font_size: 50,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 57.5,
            },
            title2: {
                color: '#ffffff',
                font_size: 37.5,
                font_family: 'Helvetica',
                font_weight: 400,
                line_height: 43.125,
            },
            title3: {
                color: '#ffffff',
                font_size: 30,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 34.5,
            },
            title4: {
                color: '#ffffff',
                font_size: 30,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 34.5,
            },
            title_symbol: {
                color: '#ffffff',
                font_size: 30,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 34.5,
            },
            bg_color: '#ffffff',
            bg_image: cover,
            logo_image: '',
        },
        normal: {
            title1: {
                color: '#ffffff',
                font_size: 50,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 57.5,
            },
            title2: {
                color: '#ffffff',
                font_size: 37.5,
                font_family: 'Helvetica',
                font_weight: 400,
                line_height: 43.125,
            },
            title3: {
                color: '#ffffff',
                font_size: 30,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 34.5,
            },
            title4: {
                color: '#ffffff',
                font_size: 30,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 34.5,
            },
            title_symbol: {
                color: '#ffffff',
                font_size: 30,
                font_family: 'Helvetica',
                font_weight: 700,
                line_height: 34.5,
            },
            bg_color: '#ffffff',
            bg_image: 'https://media.firefly.land/maskbook/dcc90682-c057-4851-a3b8-da20da363f03/sky copy.jpg',
            logo_image: '',
        },
        is_default: false,
    }
}

export const PRESET_THEMES =
    process.env.NODE_ENV === 'development' ?
        [
            createTheme(
                '358b5740-0522-4d79-97cd-1ad64dd173f7',
                'https://media.firefly.land/maskbook/6fbc1d44-bd24-462e-925c-127ec3c9c46b/1.jpg',
            ),
            createTheme(
                '64506d2e-9f35-44bc-957f-d0b80a764972',
                'https://media.firefly.land/maskbook/58e7c73b-7f53-49e5-9b83-b369fc413032/2.jpg',
            ),
        ]
    :   [
            createTheme(
                'd3d018ad-0b89-4524-a54f-f036d22b9583',
                'https://media.firefly.land/maskbook/74bca961-5ae6-41e1-b40a-9ecbff4ef7d3/1.jpg',
            ),
            createTheme(
                'b665a22b-dc13-4f88-b09d-6eb5c016861e',
                'https://media.firefly.land/maskbook/debd814f-482a-45c7-804a-cefc2b0780e8/2.jpg',
            ),
        ]

export const MAX_CUSTOM_THEMES = 3

export const WalletRelatedTypes = [FireflyRedPacketAPI.StrategyType.nftOwned, FireflyRedPacketAPI.StrategyType.tokens]
