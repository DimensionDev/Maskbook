import {
    MaskNetworkAPIs,
    RelationFavor,
    EC_Private_JsonWebKey as Native_EC_Private_JsonWebKey,
    EC_Public_JsonWebKey as Native_EC_Public_JsonWebKey,
    AESJsonWebKey as Native_AESJsonWebKey,
    MobileProfile,
    MobileProfileRelation,
} from '@masknet/public-api'
import { Environment, assertEnvironment } from '@dimensiondev/holoflows-kit'
import { convertIdentifierMapToRawMap, ECKeyIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { launchPageSettings } from '../../settings/settings'
import Services from '../../extension/service'
import { WalletMessages } from '@masknet/plugin-wallet'
import { WalletRPC } from '../../plugins/Wallet/messages'
import { ProviderType } from '@masknet/web3-shared-evm'
import { MaskMessages } from '../messages'

const stringToPersonaIdentifier = (input: string) => ECKeyIdentifier.from(input).unwrap()
const stringToProfileIdentifier = (input: string) => ProfileIdentifier.from(input).unwrap()

function profileRelationFormatter(
    p: MobileProfile,
    personaIdentifier: string | undefined,
    favor: RelationFavor | undefined = RelationFavor.UNCOLLECTED,
): MobileProfileRelation {
    return {
        identifier: p.identifier,
        nickname: p.nickname,
        linkedPersona: !!p.linkedPersona,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        personaIdentifier,
        favor,
    }
}

export const MaskNetworkAPI: MaskNetworkAPIs = {
    async app_resume() {
        MaskMessages.events.mobile_app_resumed.sendToAll()
    },
    async app_suspended() {
        MaskMessages.events.mobile_app_suspended.sendToAll()
    },
    app_isPluginEnabled: ({ pluginID }) => Services.Settings.getPluginMinimalModeEnabled(pluginID).then((x) => !x),
    app_setPluginStatus: ({ pluginID, enabled }) => Services.Settings.setPluginMinimalModeEnabled(pluginID, !enabled),
    settings_getTrendingDataSource: () => Services.Settings.getTrendingDataSource(),
    settings_setTrendingDataSource: ({ provider }) => Services.Settings.setTrendingDataSource(provider),
    settings_getLaunchPageSettings: async () => launchPageSettings.value,
    settings_getTheme: () => Services.Settings.getTheme(),
    settings_setTheme: ({ theme }) => Services.Settings.setTheme(theme),
    settings_getLanguage: () => Services.Settings.getLanguage(),
    settings_setLanguage: ({ language }) => Services.Settings.setLanguage(language),
    settings_createBackupJson: (options) => Services.Backup.mobile_generateBackupJSON(options),
    settings_getBackupPreviewInfo: async ({ backupInfo }) => {
        const data = await Services.Backup.addUnconfirmedBackup(backupInfo)
        return data.unwrap().info
    },
    settings_restoreBackup: async ({ backupInfo }) => {
        const { id } = (await Services.Backup.addUnconfirmedBackup(backupInfo)).unwrap()
        await Services.Backup.restoreUnconfirmedBackup({ id, action: 'confirm' })
    },
    persona_createPersonaByMnemonic: async ({ mnemonic, nickname, password }) => {
        const x = await Services.Identity.mobile_restoreFromMnemonicWords(mnemonic, nickname, password)
        return x!
    },
    persona_queryPersonas: async ({ identifier, hasPrivateKey }) => {
        const id = identifier ? stringToPersonaIdentifier(identifier) : undefined
        const result = await Services.Identity.mobile_queryPersonas({ hasPrivateKey, identifier: id })

        return result
    },
    persona_queryMyPersonas: async ({ network }) => {
        return Services.Identity.mobile_queryPersonas({ hasPrivateKey: true, network })
    },
    persona_updatePersonaInfo: ({ identifier, data }) => {
        const { nickname } = data
        return Services.Identity.renamePersona(stringToPersonaIdentifier(identifier), nickname)
    },
    persona_removePersona: ({ identifier }) =>
        Services.Identity.deletePersona(stringToPersonaIdentifier(identifier), 'delete even with private'),
    persona_restoreFromJson: async ({ backup }) => {
        const { id } = (await Services.Backup.addUnconfirmedBackup(backup)).unwrap()
        await Services.Backup.restoreUnconfirmedBackup({ id, action: 'confirm' })
    },
    persona_connectProfile: async ({ profileIdentifier, personaIdentifier }) => {
        const profileId = stringToProfileIdentifier(profileIdentifier)
        const identifier = stringToPersonaIdentifier(personaIdentifier)
        await Services.Identity.attachProfile(profileId, identifier, {
            connectionConfirmState: 'confirmed',
        })

        const [persona] = await Services.Identity.mobile_queryPersonas({ identifier })
        if (!persona?.hasPrivateKey) throw new Error('invalid persona')
        await Services.Identity.setupPersona(identifier)
    },
    persona_disconnectProfile: async ({ identifier }) => {
        await Services.Identity.detachProfile(stringToProfileIdentifier(identifier))
    },
    persona_restoreFromPrivateKey: async ({ privateKey, nickname }) => {
        const identifier = await Services.Identity.createPersonaByPrivateKey(privateKey, nickname)
        const persona = await Services.Identity.mobile_queryPersonas({ identifier })
        return persona[0]
    },
    persona_backupPrivateKey: async ({ identifier }) => {
        const privateKey = await Services.Backup.backupPersonaPrivateKey(stringToPersonaIdentifier(identifier))
        return privateKey
    },
    persona_queryPersonaByPrivateKey: async ({ privateKey }) => {
        const persona = await Services.Identity.mobile_queryPersonaByPrivateKey(privateKey)
        return persona || undefined
    },
    persona_getCurrentPersonaIdentifier: async () => {
        const identifier = await Services.Settings.getCurrentPersonaIdentifier()
        return identifier?.toText()
    },
    persona_setCurrentPersonaIdentifier: async ({ identifier }) => {
        await Services.Settings.setCurrentPersonaIdentifier(stringToPersonaIdentifier(identifier))
    },
    persona_logout: async ({ identifier }) => {
        await Services.Identity.logoutPersona(stringToPersonaIdentifier(identifier))
    },
    profile_queryProfiles: async ({ network }) => {
        return Services.Identity.mobile_queryProfiles({ network })
    },
    profile_queryMyProfiles: async ({ network }) => {
        return Services.Identity.mobile_queryOwnedProfiles(network)
    },
    profile_updateProfileInfo: async ({ identifier, data }) => {
        await Services.Identity.updateProfileInfo(stringToProfileIdentifier(identifier), data)
    },
    profile_removeProfile: async ({ identifier }) => {
        await Services.Identity.mobile_removeProfile(stringToProfileIdentifier(identifier))
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
        const records = await Services.Identity.queryRelationPaged(
            await Services.Settings.getCurrentPersonaIdentifier(),
            { network, after: afterRecord },
            count,
        )

        const profiles = await Services.Identity.mobile_queryProfiles({ identifiers: records.map((x) => x.profile) })

        return profiles.map((profile) => {
            const record = records.find((x) => x.profile.toText() === profile.identifier)
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
        const wallets = await WalletRPC.getLegacyWalletRecords()
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
    get_all_indexedDB_records: async () => {
        const personas = await Services.Identity.mobile_queryPersonaRecordsFromIndexedDB()
        const profiles = await Services.Identity.mobile_queryProfileRecordFromIndexedDB()
        const relations = await Services.Identity.mobile_queryRelationsRecordFromIndexedDB()
        return {
            personas: personas.map((x) => ({
                mnemonic: x.mnemonic,
                nickname: x.nickname,
                publicKey: x.publicKey as JsonWebKey as unknown as Native_EC_Public_JsonWebKey,
                privateKey: x.privateKey as JsonWebKey as unknown as Native_EC_Private_JsonWebKey,
                localKey: x.localKey as JsonWebKey as unknown as Native_AESJsonWebKey,
                identifier: x.identifier.toText(),
                linkedProfiles: Object.fromEntries(convertIdentifierMapToRawMap(x.linkedProfiles)),
                createdAt: x.createdAt.getTime(),
                updatedAt: x.createdAt.getTime(),
                hasLogout: x.hasLogout,
                uninitialized: x.uninitialized,
            })),
            profiles: profiles.map((x) => ({
                identifier: x.identifier.toText(),
                nickname: x.nickname,
                localKey: x.localKey as JsonWebKey as unknown as Native_AESJsonWebKey,
                linkedPersona: x.linkedPersona?.toText(),
                createdAt: x.createdAt.getTime(),
                updatedAt: x.updatedAt.getTime(),
            })),
            relations: relations.map((x) => ({
                profile: x.profile.toText(),
                linked: x.linked.toText(),
                network: x.network,
                favor: x.favor,
            })),
        }
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
