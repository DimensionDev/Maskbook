import { defineSocialNetworkUI } from '../../../social-network/ui'
import { host, hostMobileURL, hostURL, sharedSettings } from '../index'
import { shouldDisplayWelcomeDefault } from '../../../social-network/defaults/shouldDisplayWelcome'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { setStorage } from '../../../utils/browser.storage'
import { twitterUIDataSources } from './dataSources'
import { twitterUITasks } from './tasks'
import { twitterUIFetch } from './fetch'
import { twitterUIInjections } from './inject'

export const instanceOfTwitterUI = defineSocialNetworkUI({
    ...sharedSettings,
    ...twitterUIDataSources,
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
    friendlyName: 'Twitter (Developing...)',
    setupAccount: async () => {
        await browser.permissions.request({
            origins: [`${hostURL}/*`, `${hostMobileURL}/*`],
        })
        setStorage(host, { forceDisplayWelcome: true }).then()
        window.open(hostURL as string)
    },
    ignoreSetupAccount() {
        setStorage(host, { userIgnoredWelcome: true }).then()
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
})
