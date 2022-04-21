import { encodeArrayBuffer } from '@dimensiondev/kit'
import type { PersonaIdentifier } from '@masknet/shared-base'
import { encode } from '@msgpack/msgpack'
import { queryPersonaDB } from '../../database/persona/db'

export async function backupPersonaPrivateKey(identifier: PersonaIdentifier): Promise<string> {
    const profile = await queryPersonaDB(identifier)
    if (!profile?.privateKey) return ''

    const encodePrivateKey = encode(profile.privateKey)
    return encodeArrayBuffer(encodePrivateKey)
}
