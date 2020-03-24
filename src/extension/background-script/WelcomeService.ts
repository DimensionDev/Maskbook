import { OnlyRunInContext } from '@holoflows/kit'
import { encodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { sleep } from '../../utils/utils'
import getCurrentNetworkWorker from '../../social-network/utils/getCurrentNetworkWorker'
import { SocialNetworkUI } from '../../social-network/ui'
import { getWelcomePageURL } from '../options-page/Welcome/getWelcomePageURL'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { createPersonaByJsonWebKey, Persona } from '../../database'
import { attachProfileDB, LinkedProfileDetails } from '../../database/Persona/Persona.db'
import { CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import { ProfileIdentifier, PersonaIdentifier } from '../../database/type'
import { generateBackupJSON, BackupOptions } from './WelcomeServices/generateBackupJSON'
import { i18n } from '../../utils/i18n-next'
import { exclusiveTasks } from '../content-script/tasks'

OnlyRunInContext(['background', 'debugging'], 'WelcomeService')
export { generateBackupJSON } from './WelcomeServices/generateBackupJSON'
export { restoreBackup } from './WelcomeServices/restoreBackup'

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

export async function downloadBackup<T>(obj: T) {
    const string = typeof obj === 'string' ? obj : JSON.stringify(obj)
    const buffer = encodeText(string)
    const blob = new Blob([buffer], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date()
    const today = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    browser.downloads.download({
        url,
        filename: `maskbook-keystore-backup-${today}.json`,
        saveAs: true,
    })
    return obj
}

export async function createBackupFile(
    options: { download: boolean; onlyBackupWhoAmI: boolean } & Partial<BackupOptions>,
) {
    const obj = await generateBackupJSON(options)
    if (!options.download) return obj
    // Don't make the download pop so fast
    await sleep(1000)
    return downloadBackup(obj)
}

export async function openWelcomePage(id?: SocialNetworkUI['lastRecognizedIdentity']['value']) {
    if (id) {
        if (!getCurrentNetworkWorker(id.identifier).isValidUsername(id.identifier.userId))
            throw new TypeError(i18n.t('service_username_invalid'))
    }
    return exclusiveTasks(getWelcomePageURL(id))
}

export async function openOptionsPage(route?: string) {
    return exclusiveTasks(browser.runtime.getURL(route ? '/index.html#' + route : '/'))
}

export { createPersonaByMnemonic } from '../../database'
