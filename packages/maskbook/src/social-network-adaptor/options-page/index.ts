import { defineSocialNetworkUI, SocialNetworkUI, SocialNetwork } from '../../social-network'
import { isEnvironment, Environment, ValueRef } from '@dimensiondev/holoflows-kit'
import { IdentifierMap } from '../../database/IdentifierMap'
import Services from '../../extension/service'
import { MaskMessages } from '../../utils/messages'
import { currentImportingBackup } from '../../settings/settings'

const base: SocialNetwork.Base = {
    networkIdentifier: 'localhost',
    declarativePermissions: { origins: [] },
    shouldActivate() {
        return isEnvironment(Environment.ManifestOptions)
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
            return false
        },
        async request() {
            return false
        },
    },
    utils: { createPostContext: null! },
    async init(signal) {
        const state: Readonly<SocialNetworkUI.AutonomousState> = {
            profiles: new ValueRef([]),
            friends: new ValueRef(new IdentifierMap(new Map())),
        }
        async function load() {
            if (currentImportingBackup.value) return
            const x = await Services.Identity.queryMyProfiles()
            if (signal.aborted) return
            state.profiles.value = x
        }
        signal.addEventListener('abort', MaskMessages.events.profilesChanged.on(load))
        await load()
        return state
    },
}
defineSocialNetworkUI({
    ...base,
    async load() {
        return { default: define }
    },
})
