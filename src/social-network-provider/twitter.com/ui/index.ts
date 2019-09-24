import { defineSocialNetworkUI } from '../../../social-network/ui'
import { host, hostMobileURL, hostURL, sharedSettings } from '../index'
import { shouldDisplayWelcomeDefault } from '../../../social-network/defaults/shouldDisplayWelcome'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { setStorage } from '../../../utils/browser.storage'
import { twitterUITasks } from './tasks'
import { twitterUIFetch } from './fetch'
import { twitterUIInjections } from './inject'

export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUITasks,
    ...twitterUIInjections,
    ...twitterUIFetch,
    init: (env, pref) => {
        sharedSettings.init(env, pref)
        InitFriendsValueRef(instanceOfTwitterUI, host)
        InitMyIdentitiesValueRef(instanceOfTwitterUI, host)
    },
    shouldActivate() {
        return location.hostname.endsWith(host)
    },
    friendlyName: 'Twitter (Insider Preview)',
    setupAccount: () => {
        browser.permissions
            .request({
                origins: [`${hostURL}/*`, `${hostMobileURL}/*`],
            })
            .then(granted => {
                if (granted) {
                    setStorage(host, { forceDisplayWelcome: true }).then()
                    window.open(hostURL as string)
                }
            })
    },
    ignoreSetupAccount() {
        setStorage(host, { userIgnoredWelcome: true }).then()
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
})
