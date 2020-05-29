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

export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUITasks,
    ...twitterUIInjections,
    ...twitterUIFetch,
    ...twitterUICustomUI,
    i18nOverwrite: {
        en: {
            additional_post_box__encrypted_post_pre: [
                'This tweet is encrypted with Maskbook (@realmaskbook).',
                'Install maskbook.com to decrypt it. 📮🔑',
                '#Maskbook',
                '🚫Do not click this link. 🔐{{encrypted}}🔐',
            ].join('\n\n'),
        },
        zh: {
            additional_post_box__encrypted_post_pre: [
                '此推文已被 Maskbook（@realmaskbook）加密。',
                '請安裝 maskbook.com 進行解密。📮🔑',
                '#Maskbook',
                '🚫請不要點擊此連結。🔐{{encrypted}}🔐',
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
    friendlyName: 'Twitter (Insider Preview)',
    requestPermission() {
        // TODO: wait for webextension-shim to support <all_urls> in permission.
        if (webpackEnv.target === 'WKWebview') return Promise.resolve(true)
        return browser.permissions
            .request({
                origins: [`${twitterUrl.hostLeadingUrl}/*`, `${twitterUrl.hostLeadingUrlMobile}/*`],
            })
            .then(notifyPermissionUpdate)
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
})
