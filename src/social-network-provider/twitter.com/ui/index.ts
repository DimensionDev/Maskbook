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
import { hostIdentifier, hostLeadingUrl, hostLeadingUrlMobile } from "../utils/url";

export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUITasks,
    ...twitterUIInjections,
    ...twitterUIFetch,
    init: (env, pref) => {
        sharedSettings.init(env, pref)
        InitFriendsValueRef(instanceOfTwitterUI, hostIdentifier)
        InitGroupsValueRef(instanceOfTwitterUI, hostIdentifier)
        InitMyIdentitiesValueRef(instanceOfTwitterUI, hostIdentifier)
    },
    shouldActivate(location: Location | URL = globalThis.location) {
        return location.hostname.endsWith(hostIdentifier)
    },
    friendlyName: 'Twitter (Insider Preview)',
    setupAccount: () => {
        browser.permissions
            .request({
                origins: [`${hostLeadingUrl}/*`, `${hostLeadingUrlMobile}/*`],
            })
            .then(granted => {
                if (granted) {
                    setStorage(hostIdentifier, { forceDisplayWelcome: true }).then()
                    location.href = hostLeadingUrl
                }
            })
    },
    ignoreSetupAccount() {
        setStorage(hostIdentifier, { userIgnoredWelcome: true, forceDisplayWelcome: false }).then()
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
})
