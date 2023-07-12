import { encode } from '@msgpack/msgpack'
import { encodeArrayBuffer } from '@masknet/kit'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { queryPersonaDB } from '../../database/persona/db.js'

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
