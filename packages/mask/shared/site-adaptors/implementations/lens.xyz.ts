import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://lens.xyz/*']
export const LensAdaptor: SiteAdaptor.Definition = {
    name: 'Lens',
    networkIdentifier: EnhanceableSite.Lens,
    declarativePermissions: { origins },
    homepage: 'https://lens.xyz',
    isSocialNetwork: true,
    sortIndex: 0,
}
