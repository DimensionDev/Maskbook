import { defineSocialNetworkUI } from '../../../social-network/ui'
import { sharedSettings } from '../index'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { twitterUITasks } from '../automation/old-adaptor'
import { twitterUIFetch } from '../collecting/old-adaptor'
import { twitterUIInjections } from './inject'
import { twitterUrl } from '../utils/url'
import { twitterUICustomUI, startWatchThemeColor } from '../customization/custom'
import { injectMaskbookIconToProfile, injectMaskbookIconIntoFloatingProfileCard } from './injectMaskbookIcon'
import { Flags } from '../../../utils/flags'
import { oldTwitterI18NOverwrite } from '../customization/i18n'

const origins = [`${twitterUrl.hostLeadingUrl}/*`, `${twitterUrl.hostLeadingUrlMobile}/*`]
export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUITasks,
    ...twitterUIInjections,
    ...twitterUIFetch,
    ...twitterUICustomUI,
    i18nOverwrite: oldTwitterI18NOverwrite,
    init: () => {
        startWatchThemeColor()
        sharedSettings.init()
        InitFriendsValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
        InitMyIdentitiesValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
        injectMaskbookIconToProfile()
        injectMaskbookIconIntoFloatingProfileCard()
    },
    shouldActivate(location: Location | URL = globalThis.location) {
        return location.hostname.endsWith(twitterUrl.hostIdentifier)
    },
    hasPermission() {
        return browser.permissions.contains({ origins })
    },
    requestPermission() {
        // TODO: wait for webextension-shim to support <all_urls> in permission.
        if (Flags.no_web_extension_dynamic_permission_request) return Promise.resolve(true)
        return browser.permissions.request({ origins })
    },
})
