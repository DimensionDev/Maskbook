import { OnlyRunInContext } from '@holoflows/kit'
import { encodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { sleep } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'
import { MessageCenter } from '../../utils/messages'
import getCurrentNetworkWorker from '../../social-network/utils/getCurrentNetworkWorker'
import { SocialNetworkUI } from '../../social-network/ui'
import { getWelcomePageURL } from '../options-page/Welcome/getWelcomePageURL'
import {
    generate_ECDH_256k1_KeyPair_ByMnemonicWord,
    recover_ECDH_256k1_KeyPair_ByMnemonicWord,
    MnemonicGenerationInformation,
} from '../../utils/mnemonic-code'
import { createProfileWithPersona, createPersonaByJsonWebKey, createDefaultFriendsGroup } from '../../database'
import { attachProfileDB, LinkedProfileDetails } from '../../database/Persona/Persona.db'
import { CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import { ProfileIdentifier, PersonaIdentifier } from '../../database/type'
import { generateBackupJSON } from './WelcomeServices/generateBackupJSON'

OnlyRunInContext('background', 'WelcomeService')
export { generateBackupJSON } from './WelcomeServices/generateBackupJSON'
export { restoreBackup } from './WelcomeServices/restoreBackup'

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
    return x.mnemonicRecord.words
}

/**
 * Recover new identity by a password and mnemonic words
 *
 * @param password password used to generate mnemonic word, can be empty string
 * @param word mnemonic words
 * @param info additional information
 */
export async function restoreNewIdentityWithMnemonicWord(
    word: string,
    password: string,
    info: {
        whoAmI?: ProfileIdentifier
        nickname?: string
        localKey?: JsonWebKey
        details?: LinkedProfileDetails
    },
): Promise<PersonaIdentifier> {
    const key = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(word, password)
    const pubJwk = await CryptoKeyToJsonWebKey(key.key.publicKey)
    const privJwk = await CryptoKeyToJsonWebKey(key.key.privateKey)
    const localKeyJwk = await deriveLocalKeyFromECDHKey(key.key.publicKey, key.mnemonicRecord.words).then(
        CryptoKeyToJsonWebKey,
    )

    const ecKeyID = await createPersonaByJsonWebKey({
        publicKey: pubJwk,
        privateKey: privJwk,
        localKey: info.localKey || localKeyJwk,
        mnemonic: key.mnemonicRecord,
        nickname: info.nickname,
    })
    if (info.whoAmI) {
        await attachProfileDB(info.whoAmI, ecKeyID, info.details || { connectionConfirmState: 'pending' })
    }
    return ecKeyID
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
        | MnemonicGenerationInformation
        | {
              key: CryptoKeyPair
              localKey: CryptoKey
          },
): Promise<void> {
    const { key } = usingKey

    const localKey: CryptoKey =
        'localKey' in usingKey
            ? usingKey.localKey
            : await deriveLocalKeyFromECDHKey(key.publicKey, usingKey.mnemonicRecord.words)
    const pubJwk = await CryptoKeyToJsonWebKey(key.publicKey)
    const privJwk = await CryptoKeyToJsonWebKey(key.privateKey)

    await createProfileWithPersona(
        whoAmI,
        { connectionConfirmState: 'confirmed' },
        {
            publicKey: pubJwk,
            privateKey: privJwk,
            localKey: localKey,
            mnemonic: 'mnemonicRecord' in usingKey ? usingKey.mnemonicRecord : undefined,
        },
    )
    await createDefaultFriendsGroup(whoAmI).catch(console.error)
    MessageCenter.emit('identityUpdated', undefined)
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

export async function backupMyKeyPair(options: { download: boolean; onlyBackupWhoAmI: boolean }) {
    const obj = await generateBackupJSON()
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

export { createPersonaByMnemonic } from '../../database'
