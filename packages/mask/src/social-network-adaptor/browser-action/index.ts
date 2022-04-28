import { defineSocialNetworkUI, definedSocialNetworkUIs, SocialNetworkUI, SocialNetwork } from '../../social-network'
import { isEnvironment, Environment, ValueRef } from '@dimensiondev/holoflows-kit'
import { SocialNetworkEnum } from '@masknet/encryption'
import { EnhanceableSite } from '@masknet/shared-base'

const base: SocialNetwork.Base = {
    encryptionNetwork: SocialNetworkEnum.Unknown,
    networkIdentifier: EnhanceableSite.Localhost,
    declarativePermissions: { origins: [] },
    shouldActivate(location) {
        return isEnvironment(Environment.ManifestAction)
    },
}
const define: SocialNetworkUI.Definition = {
    ...base,
    automation: {},
    collecting: {},
    configuration: {},
    customization: {},
    injection: {},
    permission: {
        async has() {
            return true
        },
        async request() {
            return true
        },
    },
    utils: { createPostContext: null! },
    async init(signal) {
        const state: Readonly<SocialNetworkUI.AutonomousState> = {
            profiles: new ValueRef([]),
        }
        const activeTab = ((await browser.tabs.query({ active: true, currentWindow: true })) || [])[0]
        if (activeTab === undefined) return state
        const location = new URL(activeTab.url || globalThis.location.href)
        for (const ui of definedSocialNetworkUIs.values()) {
            if (ui.shouldActivate(location) && ui.networkIdentifier !== EnhanceableSite.Localhost) {
                const _ = (await ui.load()).default
                if (signal.aborted) return state
                // TODO: heck, this is not what we expected.
                this.networkIdentifier = ui.networkIdentifier
                this.permission = _.permission
                this.declarativePermissions = _.declarativePermissions
                this.utils = _.utils
                return _.init(signal)
            }
        }
        return state
    },
}
defineSocialNetworkUI({
    ...base,
    async load() {
        return { default: define }
    },
})
