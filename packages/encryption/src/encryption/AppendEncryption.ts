import type { PersonaIdentifier, ProfileIdentifier, AESCryptoKey } from '@masknet/shared-base'
import type { EncryptIO } from './Encryption'

export interface AppendEncryptionOptions {
    version: -39 | -38 | -37
    postAESKey: AESCryptoKey
    iv: Uint8Array
    targets: (PersonaIdentifier | ProfileIdentifier)[]
    whoAmI: PersonaIdentifier | ProfileIdentifier
}
export declare function appendEncryptionTarget(options: AppendEncryptionOptions, io: EncryptIO): Promise<void>
