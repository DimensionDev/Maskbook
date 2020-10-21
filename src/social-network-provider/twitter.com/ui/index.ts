import { defineSocialNetworkUI } from '../../../social-network/ui'
import { sharedSettings } from '../index'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { setStorage } from '../../../utils/browser.storage'
import { twitterUITasks } from './tasks'
import { twitterUIFetch } from './fetch'
import { twitterUIInjections } from './inject'
import { InitGroupsValueRef } from '../../../social-network/defaults/GroupsValueRef'
import { twitterUrl } from '../utils/url'
import { PreDefinedVirtualGroupNames } from '../../../database/type'
import { twitterUICustomUI, startWatchThemeColor } from './custom'
import { notifyPermissionUpdate } from '../../../utils/permissions'
import { injectMaskbookIconToProfile, injectMaskbookIconIntoFloatingProfileCard } from './injectMaskbookIcon'
import { injectDashboardEntranceAtTwitter } from './injectDashboardEntrance'
import { Flags } from '../../../utils/flags'

const origins = [`${twitterUrl.hostLeadingUrl}/*`, `${twitterUrl.hostLeadingUrlMobile}/*`]
export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUITasks,
    ...twitterUIInjections,
    ...twitterUIFetch,
    ...twitterUICustomUI,
    i18nOverwrite: {
        en: {
            additional_post_box__encrypted_post_pre: [
                'This tweet is encrypted with #Maskbook (@realMaskbook). 📪🔑',
                'Install {{encrypted}} to decrypt it.',
            ].join('\n\n'),
        },
        zh: {
            additional_post_box__encrypted_post_pre: [
                '此推文已被 Maskbook（@realmaskbook）加密。📪🔑',
                '請安裝 {{encrypted}} 進行解密。',
            ].join('\n\n'),
        },
    },
    init: (env, pref) => {
        startWatchThemeColor()
        sharedSettings.init(env, pref)
        InitFriendsValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
        InitGroupsValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier, [
            PreDefinedVirtualGroupNames.friends,
            PreDefinedVirtualGroupNames.followers,
            PreDefinedVirtualGroupNames.following,
        ])
        InitMyIdentitiesValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
        injectMaskbookIconToProfile()
        injectMaskbookIconIntoFloatingProfileCard()
    },
    shouldActivate(location: Location | URL = globalThis.location) {
        return location.hostname.endsWith(twitterUrl.hostIdentifier)
    },
    friendlyName: 'Twitter',
    hasPermission() {
        return browser.permissions.contains({ origins })
    },
    requestPermission() {
        // TODO: wait for webextension-shim to support <all_urls> in permission.
        if (Flags.no_web_extension_dynamic_permission_request) return Promise.resolve(true)
        return browser.permissions.request({ origins }).then(notifyPermissionUpdate)
    },
    setupAccount: () => {
        instanceOfTwitterUI.requestPermission().then((granted) => {
            if (granted) {
                setStorage(twitterUrl.hostIdentifier, { forceDisplayWelcome: true }).then()
                location.href = twitterUrl.hostLeadingUrl
            }
        })
    },
    ignoreSetupAccount() {
        setStorage(twitterUrl.hostIdentifier, { userIgnoredWelcome: true, forceDisplayWelcome: false }).then()
    },
    injectDashboardEntrance: injectDashboardEntranceAtTwitter,
})
