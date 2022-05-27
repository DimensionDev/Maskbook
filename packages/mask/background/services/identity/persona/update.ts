import { decodeArrayBuffer } from '@dimensiondev/kit'
import type { MobilePersona } from '@masknet/public-api'
import {
    ECKeyIdentifierFromJsonWebKey,
    EC_JsonWebKey,
    isEC_Private_JsonWebKey,
    PersonaIdentifier,
} from '@masknet/shared-base'
import { decode } from '@msgpack/msgpack'
import {
    consistentPersonaDBWriteAccess,
    queryPersonaDB,
    detachProfileDB,
    deletePersonaDB,
    safeDeletePersonaDB,
    updatePersonaDB,
    queryPersonasDB,
} from '../../../database/persona/db'
import { personaRecordToMobilePersona } from './mobile'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord, validateMnemonic } from './utils'

export async function deletePersona(id: PersonaIdentifier, confirm: 'delete even with private' | 'safe delete') {
    return consistentPersonaDBWriteAccess(async (t) => {
        const d = await queryPersonaDB(id, t)
        if (!d) return
        for (const e of d.linkedProfiles) {
            await detachProfileDB(e[0], t)
        }
        if (confirm === 'delete even with private') await deletePersonaDB(id, 'delete even with private', t)
        else if (confirm === 'safe delete') await safeDeletePersonaDB(id, t)
    })
}

/** @internal looks like not directly used. let's not exposing it for now. */
export async function loginPersona(identifier: PersonaIdentifier) {
    return consistentPersonaDBWriteAccess((t) =>
        updatePersonaDB(
            { identifier, hasLogout: false },
            { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
            t,
        ),
    )
}

export async function logoutPersona(identifier: PersonaIdentifier) {
    return consistentPersonaDBWriteAccess((t) =>
        updatePersonaDB(
            { identifier, hasLogout: true },
            { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
            t,
        ),
    )
}

export async function setupPersona(id: PersonaIdentifier) {
    return consistentPersonaDBWriteAccess(async (t) => {
        const d = await queryPersonaDB(id, t)
        if (!d) throw new Error('cannot find persona')
        if (!d.privateKey) throw new Error('Cannot setup a persona without a private key')
        if (d.linkedProfiles.size === 0) throw new Error('persona should link at least one profile')
        if (d.uninitialized) {
            await updatePersonaDB(
                { identifier: id, uninitialized: false },
                { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' },
                t,
            )
        }
    })
}

export async function loginExistPersonaByPrivateKey(privateKeyString: string): Promise<PersonaIdentifier | null> {
    const privateKey = decode(decodeArrayBuffer(privateKeyString))
    if (!isEC_Private_JsonWebKey(privateKey)) throw new TypeError('Invalid private key')
    const identifier = await ECKeyIdentifierFromJsonWebKey(privateKey)

    const persona = await queryPersonaDB(identifier, undefined, true)
    if (persona) {
        await loginPersona(persona.identifier)

        return identifier
    }

    return null
}

export async function mobile_queryPersonaByPrivateKey(privateKeyString: string): Promise<MobilePersona | null> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')
    const privateKey = decode(decodeArrayBuffer(privateKeyString)) as EC_JsonWebKey
    const identifier = await ECKeyIdentifierFromJsonWebKey(privateKey)

    const persona = await queryPersonaDB(identifier, undefined, true)
    if (persona) {
        await loginPersona(persona.identifier)
        return personaRecordToMobilePersona(persona)
    }
    return null
}

export async function renamePersona(identifier: PersonaIdentifier, nickname: string): Promise<void> {
    const personas = await queryPersonasDB({ nameContains: nickname })
    if (personas.length > 0) throw new Error('Nickname already exists')

    return consistentPersonaDBWriteAccess((t) =>
        updatePersonaDB({ identifier, nickname }, { linkedProfiles: 'merge', explicitUndefinedField: 'ignore' }, t),
    )
}

export async function queryPersonaByMnemonic(mnemonic: string, password: ''): Promise<PersonaIdentifier | null> {
    const verify = validateMnemonic(mnemonic)
    if (!verify) {
        throw new Error('Verify error')
    }

    const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonic, password)
    const identifier = await ECKeyIdentifierFromJsonWebKey(key.privateKey)
    const persona = await queryPersonaDB(identifier, undefined, true)
    if (persona) {
        await loginPersona(persona.identifier)
        return persona.identifier
    }

    return null
}
