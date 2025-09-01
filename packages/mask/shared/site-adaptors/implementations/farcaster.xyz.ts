import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://farcaster.xyz/*']
export const FarcasterAdaptor: SiteAdaptor.Definition = {
    name: 'Farcaster',
    networkIdentifier: EnhanceableSite.Farcaster,
    declarativePermissions: { origins },
    homepage: 'https://farcaster.xyz',
    isSocialNetwork: true,
    sortIndex: 0,
}
