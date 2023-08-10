import type { SiteAdaptor, SiteAdaptorUI } from '@masknet/types'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { EncryptPayloadNetwork } from '@masknet/encryption'
import { EnhanceableSite, ValueRef, type ProfileInformation } from '@masknet/shared-base'
import { useThemePopupVariant } from './customization/custom.js'
import { defineSiteAdaptorUI, definedSiteAdaptorsUI } from '../../site-adaptor-infra/index.js'
import { CurrentVisitingIdentityProviderDefault, IdentityProviderDefault } from './collecting/identity.js'
import { ThemeSettingsProviderDefault } from './collecting/theme.js'

const base: SiteAdaptor.Base = {
    encryptPayloadNetwork: EncryptPayloadNetwork.Unknown,
    networkIdentifier: EnhanceableSite.Localhost,
    declarativePermissions: { origins: [] },
    shouldActivate(location) {
        return location.protocol.includes('-extension') && !isEnvironment(Environment.ManifestBackground)
    },
}
const define: SiteAdaptorUI.Definition = {
    ...base,
    automation: {},
    collecting: {
        identityProvider: IdentityProviderDefault,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderDefault,
        themeSettingsProvider: ThemeSettingsProviderDefault,
    },
    configuration: {},
    customization: {
        useTheme: useThemePopupVariant,
    },
    injection: {},
    utils: { createPostContext: null! },
    async init(signal) {
        const state: Readonly<SiteAdaptorUI.AutonomousState> = {
            profiles: new ValueRef<ProfileInformation[]>([]),
        }
        const activeTab = ((await browser.tabs.query({ active: true, currentWindow: true })) || [])[0]
        if (activeTab === undefined) return state
        const location = new URL(activeTab.url || globalThis.location.href)
        for (const ui of definedSiteAdaptorsUI.values()) {
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
defineSiteAdaptorUI({
    ...base,
    async load() {
        return { default: define }
    },
})
