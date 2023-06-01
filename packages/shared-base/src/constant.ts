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
