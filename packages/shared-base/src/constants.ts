import { NextIDPlatform } from './NextID/types.js'
import { EnhanceableSite } from './Site/types.js'

export const SOCIAL_MEDIA_NAME: Record<EnhanceableSite | string, string> = {
    [EnhanceableSite.Twitter]: 'Twitter',
    [EnhanceableSite.Facebook]: 'Facebook',
    [EnhanceableSite.Minds]: 'Minds',
    [EnhanceableSite.Instagram]: 'Instagram',
    [EnhanceableSite.OpenSea]: 'OpenSea',
    [EnhanceableSite.Localhost]: 'Localhost',
    [EnhanceableSite.Mirror]: 'Mirror',
}

export const NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP: Record<string, string> = {
    [NextIDPlatform.Twitter]: EnhanceableSite.Twitter,
}

export const SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID = [EnhanceableSite.Twitter]

export const MEDIA_VIEWER_URL = 'https://media-viewer.r2d2.to/index.html'

export const MAX_WALLET_LIMIT = 100

// Not allow 0000.1, 000100
export const NUMERIC_INPUT_REGEXP_PATTERN = '^[1-9]|^0(?![0-9])[.,]?[0-9]*$'

export const UNIT_TEST_ADDRESS = '0x732b8e42455f79F3072fe18222A7E926588B4747'
export const UNIT_TEST_ERC20_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

export const EMPTY_LIST = Object.freeze([]) as never[]
export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>

export const DEFAULT_PLUGIN_PLULISHER = { name: { fallback: 'Mask Network' }, link: 'https://mask.io/' }
