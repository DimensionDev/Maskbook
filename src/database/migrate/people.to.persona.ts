import { getMyIdentitiesDB, queryLocalKeyDB, queryPeopleDB, PersonRecord, PersonRecordPublic } from '../people'
import * as persona from '../Persona/Persona.db'
import { ECKeyIdentifier, ProfileIdentifier } from '../type'
import { IdentifierMap } from '../IdentifierMap'
import { IDBPTransaction } from 'idb'
import { CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'

export async function migratePeopleToPersona() {
    const myIDs = await getMyIdentitiesDB()
    const otherIDs = await queryPeopleDB(() => true)

    const jwkMap = new Map<CryptoKey, JsonWebKey>()
    const EC_IDMap = new IdentifierMap<ProfileIdentifier, ECKeyIdentifier>(new Map())
    const localKeysMap = new IdentifierMap<ProfileIdentifier, CryptoKey>(new Map())
    const personaMap = new IdentifierMap<ECKeyIdentifier, persona.PersonaRecord>(new Map())
    const profilesMap = new IdentifierMap<ProfileIdentifier, persona.ProfileRecord>(new Map())

    await Promise.all(
        otherIDs.concat(myIDs).map(async value => {
            if (value.publicKey) jwkMap.set(value.publicKey, await CryptoKeyToJsonWebKey(value.publicKey))
            if (value.privateKey) jwkMap.set(value.privateKey, await CryptoKeyToJsonWebKey(value.privateKey))

            if (value.publicKey) {
                EC_IDMap.set(value.identifier, await ECKeyIdentifier.fromCryptoKey(value.publicKey))
            }
        }),
    )
    await Promise.all(
        myIDs.map(async value => {
            const key = await queryLocalKeyDB(value.identifier)
            key && localKeysMap.set(value.identifier, key)
        }),
    )
    for (const profile of otherIDs.concat(myIDs)) {
        const ec_id = EC_IDMap.get(profile.identifier)!
        if (profile.publicKey) {
            updateOrCreatePersonaRecord(personaMap, ec_id, profile as PersonRecordPublic, jwkMap)
        }
        updateOrCreateProfileRecord(profilesMap, EC_IDMap, localKeysMap, profile)
    }

    const t: IDBPTransaction<any, any> = (await persona.PersonaDBAccess()).transaction(
        ['personas', 'profiles'],
        'readwrite',
    )

    for (const [v, i] of personaMap) {
        await persona.createPersonaDB(i, t)
    }
    for (const [v, i] of profilesMap) {
        await persona.createProfileDB(i, t)
    }
}

function updateOrCreatePersonaRecord(
    map: IdentifierMap<ECKeyIdentifier, persona.PersonaRecord>,
    ec_id: ECKeyIdentifier,
    profile: PersonRecordPublic,
    cryptoKeyMap: Map<CryptoKey, JsonWebKey>,
) {
    const rec = map.get(ec_id)
    if (rec) {
        if (profile.privateKey) {
            rec.privateKey = cryptoKeyMap.get(profile.privateKey)!
        }
        rec.linkedProfiles.set(profile.identifier, { connectionConfirmState: 'pending' })
    } else {
        map.set(ec_id, {
            privateKey: cryptoKeyMap.get(profile.privateKey!)!,
            publicKey: cryptoKeyMap.get(profile.publicKey)!,
            createdAt: new Date(0),
            updatedAt: new Date(),
            linkedProfiles: new IdentifierMap(new Map()),
            identifier: ec_id,
        })
        map.get(ec_id)!.linkedProfiles.set(profile.identifier, { connectionConfirmState: 'pending' })
    }
}
function updateOrCreateProfileRecord(
    map: IdentifierMap<ProfileIdentifier, persona.ProfileRecord>,
    ec_idMap: IdentifierMap<ProfileIdentifier, ECKeyIdentifier>,
    localKeyMap: IdentifierMap<ProfileIdentifier, CryptoKey>,
    profile: PersonRecord,
) {
    const rec = map.get(profile.identifier)
    if (rec) {
        rec.nickname = rec.nickname ?? profile.nickname
    } else {
        map.set(profile.identifier, {
            createdAt: new Date(0),
            updatedAt: new Date(),
            identifier: profile.identifier,
            nickname: profile.nickname,
            localKey: localKeyMap.get(profile.identifier),
            linkedPersona: ec_idMap.get(profile.identifier),
        })
    }
}
