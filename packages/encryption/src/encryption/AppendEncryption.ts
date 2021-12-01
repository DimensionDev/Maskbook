import type {
    PersonaIdentifier,
    ProfileIdentifier,
    AESCryptoKey,
    IdentifierMap,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import type { EncryptIO, EncryptionResultE2E } from './Encryption'

export interface AppendEncryptionOptions {
    version: -39 | -38 | -37
    postAESKey: AESCryptoKey
    iv: Uint8Array
    targets: (PersonaIdentifier | ProfileIdentifier)[]
    whoAmI: PersonaIdentifier | ProfileIdentifier
}
export interface AppendEncryptionResult {
    e2e?: IdentifierMap<ECKeyIdentifier, EncryptionResultE2E>
}
export declare function appendEncryptionTarget(
    options: AppendEncryptionOptions,
    io: EncryptIO,
): Promise<AppendEncryptionResult>
