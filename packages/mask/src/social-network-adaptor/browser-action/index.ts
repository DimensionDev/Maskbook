import type { SocialNetwork, SocialNetworkUI } from '@masknet/types'
import { defineSocialNetworkUI, definedSocialNetworkUIs } from '../../social-network/index.js'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { SocialNetworkEnum } from '@masknet/encryption'
import { EnhanceableSite, ValueRef } from '@masknet/shared-base'
import { useThemePopupVariant } from './customization/custom.js'

const base: SocialNetwork.Base = {
    encryptionNetwork: SocialNetworkEnum.Unknown,
    networkIdentifier: EnhanceableSite.Localhost,
    declarativePermissions: { origins: [] },
    shouldActivate() {
        return isEnvironment(Environment.ManifestAction)
    },
}
const define: SocialNetworkUI.Definition = {
    ...base,
    automation: {},
    // @ts-ignore
    collecting: {},
    configuration: {},
    customization: {
        useTheme: useThemePopupVariant,
    },
    injection: {},
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
