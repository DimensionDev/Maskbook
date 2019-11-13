import { OnlyRunInContext } from '@holoflows/kit'
import { encodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { sleep } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'
import {
    getLocalKeysDB,
    getMyIdentitiesDB,
    PersonRecordPublic,
    PersonRecordPublicPrivate,
    queryLocalKeyDB,
    queryMyIdentityAtDB,
    queryPeopleDB,
    storeLocalKeyDB,
    storeMyIdentityDB,
    PersonRecord,
} from '../../database/people'
import {
    BackupJSONFileLatest,
    JSON_HINT_FOR_POWER_USER,
    UpgradeBackupJSONFile,
} from '../../utils/type-transform/BackupFile'
import { ProfileIdentifier, ProfileIdentifier } from '../../database/type'
import { MessageCenter } from '../../utils/messages'
import getCurrentNetworkWorker from '../../social-network/utils/getCurrentNetworkWorker'
import { SocialNetworkUI } from '../../social-network/ui'
import { getWelcomePageURL } from '../options-page/Welcome/getWelcomePageURL'
import { getMyProveBio } from './CryptoServices/getMyProveBio'
import {
    generate_ECDH_256k1_KeyPair_ByMnemonicWord,
    recover_ECDH_256k1_KeyPair_ByMnemonicWord,
} from '../../utils/mnemonic-code'
import { derive_AES_GCM_256_Key_From_PBKDF2, import_PBKDF2_Key, import_ECDH_256k1_Key } from '../../utils/crypto.subtle'
import { JsonWebKeyToCryptoKey, CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { migrateHelper_operateDB } from '../../database/migrate/people.to.persona'
import { IdentifierMap } from '../../database/IdentifierMap'

OnlyRunInContext('background', 'WelcomeService')
async function generateBackupJSON(
    whoAmI: ProfileIdentifier,
    onlyBackupWhoAmI: boolean,
    full = false,
): Promise<BackupJSONFileLatest> {
    const manifest = browser.runtime.getManifest()
    const myIdentitiesInDB: BackupJSONFileLatest['whoami'] = []
    const peopleInDB: NonNullable<BackupJSONFileLatest['people']> = []

    const promises: Promise<void>[] = []
    //#region data.whoami
    const localKeys = await getLocalKeysDB()
    const myIdentity = await getMyIdentitiesDB()
    if (!whoAmI.isUnknown) {
        if ((await hasValidIdentity(whoAmI)) === false) {
            throw new Error('Generate fail')
        }
    }
    async function addMyIdentitiesInDB(data: PersonRecordPublicPrivate) {
        myIdentitiesInDB.push({
            network: data.identifier.network,
            userId: data.identifier.userId,
            nickname: data.nickname,
            previousIdentifiers: data.previousIdentifiers,
            localKey: await exportKey(localKeys.get(data.identifier.network)![data.identifier.userId]!),
            publicKey: await exportKey(data.publicKey),
            privateKey: await exportKey(data.privateKey),
            [JSON_HINT_FOR_POWER_USER]:
                (await getMyProveBio(data.identifier)) ||
                'We are sorry, but this field is not available. It may help to set up Maskbook again.',
        })
    }
    for (const id of myIdentity) {
        if (onlyBackupWhoAmI) if (!id.identifier.equals(whoAmI)) continue
        promises.push(addMyIdentitiesInDB(id))
    }
    //#endregion

    //#region data.people
    async function addPeople(data: PersonRecordPublic) {
        peopleInDB.push({
            network: data.identifier.network,
            userId: data.identifier.userId,
            groups: data.groups.map(g => ({
                network: g.network,
                groupID: g.groupID,
                virtualGroupOwner: g.virtualGroupOwner,
            })),
            nickname: data.nickname,
            previousIdentifiers: (data.previousIdentifiers || []).map(p => ({ network: p.network, userId: p.userId })),
            publicKey: await exportKey(data.publicKey),
        })
    }
    if (full) {
        for (const p of await queryPeopleDB(() => true)) {
            if (p.publicKey) promises.push(addPeople(p as PersonRecordPublic))
        }
    }
    //#endregion

    await Promise.all(promises)
    const grantedHostPermissions = (await browser.permissions.getAll()).origins || []
    if (full)
        return {
            version: 1,
            whoami: myIdentitiesInDB,
            people: peopleInDB,
            grantedHostPermissions,
            maskbookVersion: manifest.version,
        }
    else
        return {
            version: 1,
            whoami: myIdentitiesInDB,
            grantedHostPermissions,
            maskbookVersion: manifest.version,
        }
    function exportKey(k: CryptoKey) {
        return crypto.subtle.exportKey('jwk', k)
    }
}
async function hasValidIdentity(whoAmI: ProfileIdentifier) {
    const local = await queryLocalKeyDB(whoAmI)
    const ecdh = await queryMyIdentityAtDB(whoAmI)
    return !!local && !!ecdh && !!ecdh.privateKey && !!ecdh.publicKey
}

/**
 *
 * Generate new identity by a password
 *
 * @param whoAmI Who Am I
 * @param password password used to generate mnemonic word, can be empty string
 */
export async function createNewIdentityByMnemonicWord(whoAmI: ProfileIdentifier, password: string): Promise<string> {
    const x = await generate_ECDH_256k1_KeyPair_ByMnemonicWord(password)
    await generateNewIdentity(whoAmI, x)
    return x.mnemonicWord
}

/**
 *
 * Recover new identity by a password and mnemonic words
 *
 * @param whoAmI Who Am I
 * @param password password used to generate mnemonic word, can be empty string
 * @param word mnemonic words
 */
export async function restoreNewIdentityWithMnemonicWord(
    whoAmI: ProfileIdentifier,
    word: string,
    password: string,
): Promise<void> {
    await generateNewIdentity(whoAmI, await recover_ECDH_256k1_KeyPair_ByMnemonicWord(word, password))
}
/**
 * There are 2 types of usingKey.
 * ECDH256k1 Keypair + MnemonicWord
 * Or
 * ECDH256k1 Keypair + LocalKey
 *
 * This is how localKey generated:
 * ```ts
 * const pbkdf2 = import_PBKDF2_Key(ECDH256k1.publicKey)
 * const localKey = derive_AES_GCM_256_Key_From_PBKDF2(pbkdf2, MnemonicWord)
 * ```
 */
async function generateNewIdentity(
    whoAmI: ProfileIdentifier,
    usingKey:
        | {
              key: CryptoKeyPair
              mnemonicWord: string
          }
        | {
              key: CryptoKeyPair
              localKey: CryptoKey
          },
): Promise<void> {
    const { key } = usingKey
    if ('localKey' in usingKey) {
        await storeLocalKeyDB(whoAmI, usingKey.localKey)
    } else {
        const pub = await CryptoKeyToJsonWebKey(key.publicKey)

        // ? Derive method: publicKey as "password" and password for the mnemonicWord as hash
        const pbkdf2 = await import_PBKDF2_Key(encodeText(pub.x! + pub.y!))
        const localKey = await derive_AES_GCM_256_Key_From_PBKDF2(pbkdf2, encodeText(usingKey.mnemonicWord))

        await storeLocalKeyDB(whoAmI, localKey)
    }
    // TODO: If there is some old key that will be overwritten, warn the user.
    await storeMyIdentityDB({
        groups: [],
        identifier: whoAmI,
        publicKey: key.publicKey,
        privateKey: key.privateKey,
    })
    MessageCenter.emit('identityUpdated', undefined)
}

export async function attachIdentityToPersona(
    whoAmI: ProfileIdentifier,
    targetIdentity: ProfileIdentifier,
): Promise<void> {
    const id = await queryMyIdentityAtDB(targetIdentity)
    const localKey = await queryLocalKeyDB(targetIdentity)
    if (id === null || localKey === null) throw new Error('Not found')
    await generateNewIdentity(whoAmI, {
        key: { privateKey: id.privateKey, publicKey: id.publicKey },
        localKey,
    })
}

export async function downloadBackup<T>(obj: T) {
    const string = typeof obj === 'string' ? obj : JSON.stringify(obj)
    const buffer = encodeText(string)
    const blob = new Blob([buffer], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date()
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`
    browser.downloads.download({
        url,
        filename: `maskbook-keystore-backup-${today}.json`,
        saveAs: true,
    })
    return obj
}

export async function backupMyKeyPair(
    whoAmI: ProfileIdentifier,
    options: { download: boolean; onlyBackupWhoAmI: boolean },
) {
    const obj = await generateBackupJSON(whoAmI, options.onlyBackupWhoAmI)
    if (!options.download) return obj
    // Don't make the download pop so fast
    await sleep(1000)
    return downloadBackup(obj)
}

export async function openWelcomePage(id?: SocialNetworkUI['lastRecognizedIdentity']['value']) {
    if (id) {
        if (!getCurrentNetworkWorker(id.identifier).isValidUsername(id.identifier.userId))
            throw new TypeError(geti18nString('service_username_invalid'))
    }
    return browser.tabs.create({ url: getWelcomePageURL(id) })
}

export async function openOptionsPage(route: string) {
    return browser.tabs.create({ url: browser.runtime.getURL('/index.html#' + route) })
}

/**
 * Restore the backup
 */
export async function restoreBackup(json: object, whoAmI?: ProfileIdentifier): Promise<void> {
    function mapID(x: { network: string; userId: string }): ProfileIdentifier {
        return new ProfileIdentifier(x.network, x.userId)
    }
    const data = UpgradeBackupJSONFile(json, whoAmI)
    if (!data) throw new TypeError(geti18nString('service_invalid_backup_file'))

    const localKeyMap = new IdentifierMap<ProfileIdentifier, CryptoKey>(new Map())

    const myIdentitiesInBackup = Promise.all(
        data.whoami.map<Promise<PersonRecordPublicPrivate>>(async rec => {
            const profileIdentifier = mapID(rec)
            if (rec.localKey) localKeyMap.set(profileIdentifier, (await JsonWebKeyToCryptoKey(rec.localKey))!)
            return {
                identifier: profileIdentifier,
                groups: [],
                nickname: rec.nickname,
                previousIdentifiers: [],
                publicKey: await import_ECDH_256k1_Key(rec.publicKey),
                privateKey: await import_ECDH_256k1_Key(rec.privateKey),
            }
        }),
    )

    const people = Promise.all(
        (data.people || []).map<Promise<PersonRecord>>(async rec => {
            const id = new ProfileIdentifier(rec.network, rec.userId)
            return {
                identifier: id,
                groups: [],
                nickname: rec.nickname,
                previousIdentifiers: [],
                publicKey: await import_ECDH_256k1_Key(rec.publicKey),
            }
        }),
    )

    await migrateHelper_operateDB(
        await myIdentitiesInBackup,
        await people,
        async identifier => localKeyMap.get(identifier) ?? null,
    )
}
