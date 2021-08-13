import { MaskNetworkAPIs, NetworkType } from '@masknet/public-api'
import Services from '../../extension/service'
import { definedSocialNetworkWorkers } from '../../social-network/define'
import { launchPageSettings } from '../../settings/settings'
import stringify from 'json-stable-stringify'
import { encodeArrayBuffer, encodeText, unreachable } from '@dimensiondev/kit'
import { ECKeyIdentifier, Identifier, ProfileIdentifier } from '@masknet/shared-base'

const stringToIdentifier = (str: string) => Identifier.fromString(str, ECKeyIdentifier).unwrap()

export const MaskNetworkAPI: MaskNetworkAPIs = {
    web_echo: async (arg) => arg.echo,
    getDashboardURL: async () => browser.runtime.getURL('/index.html'),
    getConnectedPersonas: async () => {
        const personas = await Services.Identity.queryMyPersonas()
        const connectedPersonas: { network: string; connected: boolean }[][] = personas
            .filter((p) => !p.uninitialized)
            .map((p) => {
                const profiles = [...p.linkedProfiles]
                const providers = [...definedSocialNetworkWorkers].map((i) => {
                    const profile = profiles.find(([key]) => key.network === i.networkIdentifier)
                    return {
                        network: i.networkIdentifier,
                        connected: !!profile,
                    }
                })
                return providers
            })
        return stringify(connectedPersonas)
    },
    app_isPluginEnabled: ({ pluginID }) => Services.Settings.isPluginEnabled(pluginID),
    app_setPluginStatus: ({ pluginID, enabled }) => Services.Settings.setPluginStatus(pluginID, enabled),
    setting_getNetworkTraderProvider: ({ network }) => {
        switch (network) {
            case NetworkType.Ethereum:
                return Services.Settings.getEthereumNetworkTradeProvider()
            case NetworkType.Binance:
                return Services.Settings.getBinanceNetworkTradeProvider()
            case NetworkType.Polygon:
                return Services.Settings.getPolygonNetworkTradeProvider()
            case NetworkType.Arbitrum:
                throw new Error('TODO')
            default:
                unreachable(network)
        }
    },
    setting_setNetworkTraderProvider: ({ network, provider }) => {
        switch (network) {
            case NetworkType.Ethereum:
                return Services.Settings.setEthNetworkTradeProvider(provider)
            case NetworkType.Binance:
                return Services.Settings.setBinanceNetworkTradeProvider(provider)
            case NetworkType.Polygon:
                return Services.Settings.setPolygonNetworkTradeProvider(provider)
            case NetworkType.Arbitrum:
                throw new Error('TODO')
            default:
                unreachable(network)
        }
    },
    settings_getTrendingDataSource: () => Services.Settings.getTrendingDataSource(),
    settings_setTrendingDataSource: ({ provider }) => Services.Settings.setTrendingDataSource(provider),
    settings_getLaunchPageSettings: async () => launchPageSettings.value,
    settings_getTheme: () => Services.Settings.getTheme(),
    settings_setTheme: ({ theme }) => Services.Settings.setTheme(theme),
    settings_getLanguage: () => Services.Settings.getLanguage(),
    settings_setLanguage: ({ language }) => Services.Settings.setLanguage(language),
    settings_createBackupJson: (options) => Services.Welcome.generateBackupJSON(options),
    settings_getBackupPreviewInfo: async (str) => {
        const data = Services.Welcome.parseBackupStr(str)
        return data?.info
    },
    settings_restoreBackup: (str) => {
        try {
            const json = JSON.parse(str)
            return Services.Welcome.restoreBackup(json)
        } catch (error) {
            throw new Error('invalid json')
        }
    },
    persona_createPersonaByMnemonic: ({ mnemonic, nickname, password }) =>
        Services.Welcome.restoreNewIdentityWithMnemonicWord(mnemonic, password, { nickname }),
    persona_queryPersonas: ({ identifier, hasPrivateKey }) => {
        const id = identifier ? stringToIdentifier(identifier) : undefined
        return Services.Identity.queryPersonas(id, hasPrivateKey)
    },
    persona_queryMyPersonas: ({ network }) => Services.Identity.queryMyPersonas(network),
    persona_updatePersonaInfo: ({ identifier, data }) => {
        const { nickname } = data
        return Services.Identity.renamePersona(stringToIdentifier(identifier), nickname)
    },
    persona_removePersona: ({ identifier }) =>
        Services.Identity.deletePersona(stringToIdentifier(identifier), 'delete even with private'),
    persona_restoreFromJson: ({ backup }) => Services.Identity.restoreFromBackup(backup),
    persona_restoreFromBase64: ({ backup }) => Services.Identity.restoreFromBase64(backup),
    persona_restoreFromMnemonic: ({ mnemonic, nickname, password }) =>
        Services.Identity.restoreFromMnemonicWords(mnemonic, nickname, password),
    persona_connectProfile: async ({ network, profileUsername, personaIdentifier }) => {
        const identifier = stringToIdentifier(personaIdentifier)
        await Services.Identity.attachProfile(new ProfileIdentifier(network, profileUsername), identifier, {
            connectionConfirmState: 'confirmed',
        })

        const persona = await Services.Identity.queryPersona(identifier)
        if (!persona.hasPrivateKey) throw new Error('invalid persona')
        await Services.Identity.setupPersona(persona.identifier)
    },
    persona_disconnectProfile: ({ profileUsername, network }) =>
        Services.Identity.detachProfile(new ProfileIdentifier(network, profileUsername)),
    persona_backupMnemonic: async ({ identifier }) => {
        const persona = await Services.Identity.queryPersona(stringToIdentifier(identifier))
        return persona.mnemonic
    },
    persona_backupJson: async ({ identifier }) => {
        const persona = await Services.Identity.queryPersona(stringToIdentifier(identifier))
        return Services.Welcome.generateBackupJSON({
            noPosts: true,
            noWallets: true,
            filter: { type: 'persona', wanted: [persona.identifier] },
        })
    },
    persona_backupBase64: async ({ identifier }) => {
        const file = await MaskNetworkAPI.persona_backupJson({ identifier })
        return encodeArrayBuffer(encodeText(JSON.stringify(file)))
    },
    profile_queryProfiles: ({ network }) => Services.Identity.queryProfiles(network),
    profile_queryMyProfile: ({ network }) => Services.Identity.queryMyProfiles(network),
    profile_updateProfileInfo: async ({ identifier, data }) => {
        const id = ProfileIdentifier.fromString(identifier)
        if (!(id instanceof ProfileIdentifier)) throw new Error('invalid identifier')

        await Services.Identity.updateProfileInfo(id, data)
    },
    profile_removeProfile: async ({ identifier }) => {
        const id = ProfileIdentifier.fromString(identifier)
        if (!(id instanceof ProfileIdentifier)) throw new Error('invalid identifier')

        await Services.Identity.removeProfile(id)
    },
}
