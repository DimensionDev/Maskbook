import { EnhanceableSite } from '@masknet/shared-base'

export const MATCH_PASSWORD_RE = /^(?=.{8,20}$)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\dA-Za-z]).*/
export const MAX_FILE_SIZE = 10 * 1024 * 1024

export const SOCIAL_MEDIA_ICON_FILTER_COLOR: Record<EnhanceableSite | string, string> = {
    [EnhanceableSite.Twitter]: 'drop-shadow(0px 6px 12px rgba(29, 161, 242, 0.20))',
    [EnhanceableSite.Facebook]: 'drop-shadow(0px 6px 12px rgba(60, 89, 155, 0.20))',
    [EnhanceableSite.Minds]: 'drop-shadow(0px 6px 12px rgba(33, 37, 42, 0.20))',
    [EnhanceableSite.Instagram]: 'drop-shadow(0px 6px 12px rgba(246, 100, 16, 0.20))',
    [EnhanceableSite.OpenSea]: '',
    [EnhanceableSite.Mirror]: '',
    [EnhanceableSite.Localhost]: '',
}
