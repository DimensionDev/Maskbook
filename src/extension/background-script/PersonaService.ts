import * as bip39 from 'bip39'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { restoreBackup } from './WelcomeServices/restoreBackup'
import { queryPersona } from './IdentityService'
import { Identifier, ECKeyIdentifier } from '../../database/type'
import { BackupJSONFileLatest, UpgradeBackupJSONFile } from '../../utils/type-transform/BackupFormat/JSON/latest'
import { restoreNewIdentityWithMnemonicWord } from './WelcomeService'
import { decodeText, decodeArrayBuffer } from '../../utils/type-transform/String-ArrayBuffer'
import { decompressBackupFile } from '../../utils/type-transform/BackupFileShortRepresentation'

OnlyRunInContext('background', 'PersonaService')

export async function restoreFromObject(object: null | BackupJSONFileLatest) {
    if (!object) return null
    await restoreBackup(object!)
    if (object?.personas?.length) {
        return queryPersona(Identifier.fromString(object.personas[0].identifier, ECKeyIdentifier).unwrap())
    }
    return null
}

export async function restoreFromMnemonicWords(mnemonicWords: string, nickname: string, password: string) {
    if (!bip39.validateMnemonic(mnemonicWords)) throw new Error('the mnemonic words are not valid')
    const identifier = await restoreNewIdentityWithMnemonicWord(mnemonicWords, password, {
        nickname,
    })
    return queryPersona(identifier)
}

export async function restoreFromBase64(base64: string) {
    return restoreFromObject(JSON.parse(decodeText(decodeArrayBuffer(base64))) as BackupJSONFileLatest)
}

export async function restoreFromBackup(backup: string) {
    return restoreFromObject(UpgradeBackupJSONFile(decompressBackupFile(backup)))
}
