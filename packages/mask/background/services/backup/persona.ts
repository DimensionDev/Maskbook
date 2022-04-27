import { encodeArrayBuffer } from '@dimensiondev/kit'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { encode } from '@msgpack/msgpack'
import { queryPersonaDB } from '../../database/persona/db'

export async function backupPersonaMnemonicWords(identifier: PersonaIdentifier): Promise<string | undefined> {
    const record = await queryPersonaDB(identifier)
    return record?.mnemonic?.words
}
export async function backupPersonaPrivateKey(identifier: PersonaIdentifier): Promise<string | undefined> {
    const profile = await queryPersonaDB(identifier)
    if (!profile?.privateKey) return undefined

    const encodePrivateKey = encode(profile.privateKey)
    return encodeArrayBuffer(encodePrivateKey)
}
