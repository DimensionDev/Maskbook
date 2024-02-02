import { EnhanceableSite } from '@masknet/shared-base'
import type { SiteAdaptor } from '../types.js'

const origins = ['https://www.minds.com/*', 'https://minds.com/*', 'https://cdn.minds.com/*']
export const MindsAdaptor: SiteAdaptor.Definition = {
    name: 'Minds',
    networkIdentifier: EnhanceableSite.Minds,
    declarativePermissions: { origins },
    homepage: 'https://www.minds.com',
    isSocialNetwork: true,
    sortIndex: 4,
}
