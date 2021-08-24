import type { SocialNetworkUI } from '../../../social-network'
import { languages } from '../locales'

export const i18NOverwriteTwitter: SocialNetworkUI.Customization.I18NOverwrite = {
    mask: {},
}
const resource: any = languages
for (const lng in resource) {
    for (const key in resource[lng]) {
        i18NOverwriteTwitter.mask[key] ??= {}
        i18NOverwriteTwitter.mask[key][lng] = resource[lng][key]
    }
}
