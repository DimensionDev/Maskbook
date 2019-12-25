import { defineSocialNetworkUI } from '../../../social-network/ui'
import { sharedSettings } from '../index'
import { shouldDisplayWelcomeDefault } from '../../../social-network/defaults/shouldDisplayWelcome'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { setStorage } from '../../../utils/browser.storage'
import { twitterUITasks } from './tasks'
import { twitterUIFetch } from './fetch'
import { twitterUIInjections } from './inject'
import { InitGroupsValueRef } from '../../../social-network/defaults/GroupsValueRef'
import { twitterUrl } from '../utils/url'
import { PreDefinedVirtualGroupNames } from '../../../database/type'
import { twitterUICustomUI } from './custom'

export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUITasks,
    ...twitterUIInjections,
    ...twitterUIFetch,
    ...twitterUICustomUI,
    i18nOverwrite: {
        en: {
            additional_post_box__encrypted_post_pre: {
                message: '#Maskbook ([I:b])\nDecrypt this tweet with maskbook.com @ProjectMaskbook.\n—§— /* $1 */',
            },
        },
        zh: {
            additional_post_box__encrypted_post_pre: {
                message: '#Maskbook ([I:b])\n使用 maskbook.com @ProjectMaskbook 解密这条推文。\n—§— /* $1 */',
            },
        },
    },
    init: (env, pref) => {
        sharedSettings.init(env, pref)
        InitFriendsValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
        InitGroupsValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier, [
            PreDefinedVirtualGroupNames.friends,
            PreDefinedVirtualGroupNames.followers,
            PreDefinedVirtualGroupNames.following,
        ])
        InitMyIdentitiesValueRef(instanceOfTwitterUI, twitterUrl.hostIdentifier)
    },
    shouldActivate(location: Location | URL = globalThis.location) {
        return location.hostname.endsWith(twitterUrl.hostIdentifier)
    },
    friendlyName: 'Twitter (Insider Preview)',
    requestPermission() {
        return browser.permissions.request({
            origins: [`${twitterUrl.hostLeadingUrl}/*`, `${twitterUrl.hostLeadingUrlMobile}/*`],
        })
    },
    setupAccount: () => {
        instanceOfTwitterUI.requestPermission().then(granted => {
            if (granted) {
                setStorage(twitterUrl.hostIdentifier, { forceDisplayWelcome: true }).then()
                location.href = twitterUrl.hostLeadingUrl
            }
        })
    },
    ignoreSetupAccount() {
        setStorage(twitterUrl.hostIdentifier, { userIgnoredWelcome: true, forceDisplayWelcome: false }).then()
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
})
