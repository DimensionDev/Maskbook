import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://bsky.social/*']
export const BlueskyAdaptor: SiteAdaptor.Definition = {
    name: 'Bluesky',
    networkIdentifier: EnhanceableSite.Bsky,
    declarativePermissions: { origins },
    homepage: 'https://bsky.social',
    isSocialNetwork: true,
    sortIndex: 0,
}
