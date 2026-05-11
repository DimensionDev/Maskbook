import { PluginID } from '@masknet/shared-base'

export const PLUGIN_ID = PluginID.EFP
export const PLUGIN_NAME = 'Ethereum Follow Protocol'
export const PLUGIN_DESCRIPTION = 'A native Ethereum protocol for following and tagging Ethereum accounts.'
export const EFP_APP_URL = 'https://efp.app'
export const EFP_API_URL = 'https://data.ethfollow.xyz/api/v1'
export const EFP_FALLBACK_IMAGE_URL = `${EFP_APP_URL}/assets/art/default-header.svg`

export const EFP_HOSTS = ['efp.app', 'www.efp.app', 'ethfollow.xyz', 'www.ethfollow.xyz'] as const
export const RESERVED_EFP_PATHS = ['api', 'og', 'assets', 'leaderboard', 'integrations', 'team', 'swipe'] as const

const ENS_LABEL_PATTERN = '[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?'
const EFP_USER_PATTERN = `(?:0x[\\dA-Fa-f]{40}|[1-9]\\d*|(?:${ENS_LABEL_PATTERN}\\.)+${ENS_LABEL_PATTERN})`
const RESERVED_ROUTE_PATTERN = RESERVED_EFP_PATHS.map((path) => `${path}(?:[/?#]|$)`).join('|')

export const EFP_PROFILE_URL_PATTERN = new RegExp(
    `^https:\\/\\/(?:www\\.)?(?:ethfollow\\.xyz|efp\\.app)\\/(?!${RESERVED_ROUTE_PATTERN})${EFP_USER_PATTERN}(?:\\?topEight=true)?$`,
    'u',
)
