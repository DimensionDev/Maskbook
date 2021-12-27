import stringify from 'json-stable-stringify'
import { MaskNetworkAPIs, NetworkType, RelationFavor } from '@masknet/public-api'
import { encodeArrayBuffer, encodeText, unreachable } from '@dimensiondev/kit'
import { Environment, assertEnvironment } from '@dimensiondev/holoflows-kit'
import { ECKeyIdentifier, Identifier, ProfileIdentifier } from '@masknet/shared-base'
import { definedSocialNetworkWorkers } from '../../social-network/define'
import { launchPageSettings } from '../../settings/settings'
import Services from '../../extension/service'
import type { Persona, Profile } from '../../database'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletRPC } from '../../plugins/Wallet/messages'
import { ProviderType } from '@masknet/web3-shared-evm'

const stringToPersonaIdentifier = (str: string) => Identifier.fromString(str, ECKeyIdentifier).unwrap()
const stringToProfileIdentifier = (str: string) => Identifier.fromString(str, ProfileIdentifier).unwrap()
const personaFormatter = (p: Persona) => {
    const profiles = {}

    for (const [key, value] of p.linkedProfiles) {
        const k = key.toText()
        Object.assign(profiles, { [k]: value?.connectionConfirmState })
    }

    return {
        identifier: p.identifier.toText(),
        nickname: p.nickname,
        linkedProfiles: profiles,
        hasPrivateKey: p.hasPrivateKey,
        createdAt: p.createdAt.getTime(),
        updatedAt: p.updatedAt.getTime(),
    }
}

const profileFormatter = (p: Profile) => {
    return {
        identifier: p.identifier.toText(),
        nickname: p.nickname,
        linkedPersona: !!p.linkedPersona,
        createdAt: p.createdAt.getTime(),
        updatedAt: p.updatedAt.getTime(),
    }
}

const profileRelationFormatter = (
    p: Profile,
    personaIdentifier: string | undefined,
    favor: RelationFavor | undefined,
) => {
    return {
        identifier: p.identifier.toText(),
        nickname: p.nickname,
        linkedPersona: !!p.linkedPersona,
        createdAt: p.createdAt.getTime(),
        updatedAt: p.updatedAt.getTime(),
        personaIdentifier: personaIdentifier,
        favor: favor,
    }
}

export const MaskNetworkAPI: MaskNetworkAPIs = {
    web_echo: async (arg) => arg.echo,
    getDashboardURL: async () => browser.runtime.getURL('/dashboard.html'),
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
    app_isPluginEnabled: ({ pluginID }) => Services.Settings.getPluginEnabled(pluginID),
    app_setPluginStatus: ({ pluginID, enabled }) => Services.Settings.setPluginEnabled(pluginID, enabled),
    setting_getNetworkTraderProvider: ({ network }) => {
        switch (network) {
            case NetworkType.Ethereum:
                return Services.Settings.getEthereumNetworkTradeProvider()
            case NetworkType.Binance:
                return Services.Settings.getBinanceNetworkTradeProvider()
            case NetworkType.Polygon:
                return Services.Settings.getPolygonNetworkTradeProvider()
            case NetworkType.Arbitrum:
                return Services.Settings.getArbitrumNetworkTradeProvider()
            case NetworkType.xDai:
                return Services.Settings.getxDaiNetworkTradeProvider()
            case NetworkType.Boba:
                return Services.Settings.getBobaNetworkTradeProvider()
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
                return Services.Settings.setArbitrumNetworkTradeProvider(provider)
            case NetworkType.xDai:
                return Services.Settings.setxDaiNetworkTradeProvider(provider)
            case NetworkType.Boba:
                return Services.Settings.setBobaNetworkTradeProvider(provider)
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
    settings_getBackupPreviewInfo: async ({ backupInfo }) => {
        const data = Services.Welcome.parseBackupStr(backupInfo)
        return data?.info
    },
    settings_restoreBackup: ({ backupInfo }) => {
        try {
            const json = JSON.parse(backupInfo)
            return Services.Welcome.restoreBackup(json)
        } catch (error) {
            throw new Error('invalid json')
        }
    },
    persona_createPersonaByMnemonic: async ({ mnemonic, nickname, password }) => {
        const x = await Services.Identity.restoreFromMnemonicWords(mnemonic, nickname, password)
        return personaFormatter(x)
    },
    persona_queryPersonas: async ({ identifier, hasPrivateKey }) => {
        const id = identifier ? stringToPersonaIdentifier(identifier) : undefined
        const result = await Services.Identity.queryPersonas(id, hasPrivateKey)

        return result?.map(personaFormatter)
    },
    persona_queryMyPersonas: async ({ network }) => {
        const result = await Services.Identity.queryMyPersonas(network)

        return result?.map(personaFormatter)
    },
    persona_updatePersonaInfo: ({ identifier, data }) => {
        const { nickname } = data
        return Services.Identity.renamePersona(stringToPersonaIdentifier(identifier), nickname)
    },
    persona_removePersona: ({ identifier }) =>
        Services.Identity.deletePersona(stringToPersonaIdentifier(identifier), 'delete even with private'),
    persona_restoreFromJson: async ({ backup }) => {
        const result = await Services.Identity.restoreFromBackup(backup)

        if (!result) throw new Error('invalid json')
    },
    persona_restoreFromBase64: async ({ backup }) => {
        const result = await Services.Identity.restoreFromBase64(backup)

        if (!result) throw new Error('invalid base64')
    },
    persona_connectProfile: async ({ profileIdentifier, personaIdentifier }) => {
        const profileId = stringToProfileIdentifier(profileIdentifier)
        const identifier = stringToPersonaIdentifier(personaIdentifier)
        await Services.Identity.attachProfile(profileId, identifier, {
            connectionConfirmState: 'confirmed',
        })

        const persona = await Services.Identity.queryPersona(identifier)
        if (!persona.hasPrivateKey) throw new Error('invalid persona')
        await Services.Identity.setupPersona(persona.identifier)
    },
    persona_disconnectProfile: async ({ identifier }) => {
        await Services.Identity.detachProfile(stringToProfileIdentifier(identifier))
    },
    persona_backupMnemonic: async ({ identifier }) => {
        const persona = await Services.Identity.queryPersona(stringToPersonaIdentifier(identifier))
        return persona.mnemonic?.words
    },
    persona_backupJson: async ({ identifier }) => {
        const persona = await Services.Identity.queryPersona(stringToPersonaIdentifier(identifier))
        return Services.Welcome.generateBackupJSON({
            noPosts: true,
            noWallets: true,
            filter: { type: 'persona', wanted: [persona.identifier] },
        })
    },
    persona_restoreFromPrivateKey: async ({ privateKey, nickname }) => {
        const identifier = await Services.Identity.createPersonaByPrivateKey(privateKey, nickname)
        const persona = await Services.Identity.queryPersona(identifier)
        return personaFormatter(persona)
    },
    persona_backupBase64: async ({ identifier }) => {
        const file = await MaskNetworkAPI.persona_backupJson({ identifier })
        return encodeArrayBuffer(encodeText(JSON.stringify(file)))
    },
    persona_backupPrivateKey: async ({ identifier }) => {
        const privateKey = await Services.Identity.exportPersonaPrivateKey(stringToPersonaIdentifier(identifier))
        return privateKey
    },
    persona_getCurrentPersonaIdentifier: async () => {
        const identifier = await Services.Settings.getCurrentPersonaIdentifier()
        return identifier?.toText()
    },
    persona_setCurrentPersonaIdentifier: async ({ identifier }) => {
        await Services.Settings.setCurrentPersonaIdentifier(stringToPersonaIdentifier(identifier))
    },
    profile_queryProfiles: async ({ network }) => {
        const result = await Services.Identity.queryProfiles(network)

        return result?.map(profileFormatter)
    },
    profile_queryMyProfiles: async ({ network }) => {
        const result = await Services.Identity.queryMyProfiles(network)

        return result?.map(profileFormatter)
    },
    profile_updateProfileInfo: async ({ identifier, data }) => {
        await Services.Identity.updateProfileInfo(stringToProfileIdentifier(identifier), data)
    },
    profile_removeProfile: async ({ identifier }) => {
        await Services.Identity.removeProfile(stringToProfileIdentifier(identifier))
    },
    profile_updateRelation: async ({ profile, linked, favor }) => {
        await Services.Identity.updateRelation(
            stringToProfileIdentifier(profile),
            stringToPersonaIdentifier(linked),
            favor,
        )
    },
    profile_queryRelationPaged: async ({ network, after, count }) => {
        let afterRecord
        if (after) {
            afterRecord = {
                ...after,
                profile: stringToProfileIdentifier(after.profile),
                linked: stringToPersonaIdentifier(after.linked),
            }
        }
        const records = await Services.Identity.queryRelationPaged({ network, after: afterRecord }, count)

        const profiles = await Services.Identity.queryProfilesWithIdentifiers(records.map((x) => x.profile))

        return profiles.map((profile) => {
            const record = records.find((x) => x.profile.equals(profile.identifier))
            const favor = record?.favor
            const personaIdentifier = record?.linked.toText()
            return profileRelationFormatter(profile, personaIdentifier, favor)
        })
    },
    wallet_updateEthereumAccount: async ({ account }) => {
        await WalletRPC.updateAccount({
            account,
            providerType: ProviderType.MaskWallet,
        })
        WalletMessages.events.walletsUpdated.sendToAll()
    },
    wallet_updateEthereumChainId: async ({ chainId }) => {
        await WalletRPC.updateAccount({
            chainId,
        })
    },
    wallet_getLegacyWalletInfo: async () => {
        const wallets = await WalletRPC.getLegacyWallets()
        return wallets.map((x) => ({
            address: x.address,
            name: x.name || undefined,
            path: x.path,
            mnemonic: x.mnemonic,
            passphrase: x.passphrase,
            private_key: x._private_key_,
            createdAt: x.createdAt.getTime(),
            updatedAt: x.updatedAt.getTime(),
        }))
    },
    async SNSAdaptor_getCurrentDetectedProfile() {
        const { activatedSocialNetworkUI } = await import('../../social-network')
        return activatedSocialNetworkUI.collecting.identityProvider?.recognized.value.identifier.toText()
    },
}

function wrapWithAssert(env: Environment, f: Function) {
    return (...args: any[]) => {
        assertEnvironment(env)
        return f(...args)
    }
}

try {
    for (const _key in MaskNetworkAPI) {
        const key = _key as keyof MaskNetworkAPIs
        const f: Function = MaskNetworkAPI[key]

        if (key.startsWith('SNSAdaptor_')) {
            MaskNetworkAPI[key] = wrapWithAssert(Environment.ContentScript, f)
        } else {
            MaskNetworkAPI[key] = wrapWithAssert(Environment.ManifestBackground, f)
        }
    }
} catch {}
