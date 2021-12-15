import { IdentifierMap } from '@masknet/shared-base'
import { isEnvironment, Environment, ValueRef } from '@dimensiondev/holoflows-kit'
import { SocialNetworkID } from '../../../shared'
import { defineSocialNetworkUI, definedSocialNetworkUIs, SocialNetworkUI, SocialNetwork } from '../../social-network'

const base: SocialNetwork.Base = {
    networkIdentifier: SocialNetworkID.BrowserAction,
    name: '',
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
            friends: new ValueRef(new IdentifierMap(new Map())),
        }
        const activeTab = ((await browser.tabs.query({ active: true, currentWindow: true })) || [])[0]
        if (activeTab === undefined) return state
        const location = new URL(activeTab.url || globalThis.location.href)
        for (const ui of definedSocialNetworkUIs.values()) {
            if (ui.shouldActivate(location) && ui.networkIdentifier !== SocialNetworkID.BrowserAction) {
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
