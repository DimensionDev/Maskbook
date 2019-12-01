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
    setupAccount: () => {
        browser.permissions
            .request({
                origins: [`${twitterUrl.hostLeadingUrl}/*`, `${twitterUrl.hostLeadingUrlMobile}/*`],
            })
            .then(granted => {
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
