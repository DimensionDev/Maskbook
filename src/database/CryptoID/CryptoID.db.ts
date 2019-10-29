/// <reference path="../global.d.ts" />

import { OnlyRunInContext } from '@holoflows/kit/es'
import { PersonIdentifier, CryptoIDIdentifier, Identifier, ECKeyIdentifier } from '../type'
/**
 * Database structure:
 *
 * # ObjectStore `self`:
 * @description Store self CryptoIDs.
 * @type {CryptoIDRecordDb}
 * @keys inline, {@link CryptoIDRecordDb.identifier}
 *
 * # ObjectStore `others`:
 * @description Store others CryptoIDs.
 * @type {CryptoIDRecordDb}
 * @keys inline, {@link CryptoIDRecordDb.identifier}
 *
 * # ObjectStore `profiles`:
 * @description Store profiles.
 * @type {ProfileRecord}
 * A person links to 0 or more profiles.
 * Each profile links to 0 or 1 CryptoIDs.
 * @keys inline, {@link ProfileRecord.identifier}
 */

OnlyRunInContext('background', 'CryptoID db')

//#region Type
interface ProfileRecord {
    identifier: PersonIdentifier
    nickname?: string
    localKey?: CryptoKey
    linkedCryptoID?: CryptoIDIdentifier
    createdAt: Date
    updatedAt: Date
}

interface CryptoIDRecord {
    identifier: CryptoIDIdentifier
    publicKey: CryptoKey
    privateKey?: CryptoKey
    nickname: string
    attachedProfiles: Set<PersonIdentifier>
    createdAt: Date
    updatedAt: Date
}
type ProfileRecordDb = Omit<ProfileRecord, 'identifier'> & { identifier: string }
type CryptoIDRecordDb = Omit<CryptoIDRecord, 'identifier'> & { identifier: string }
//#endregion

//#region out db & to db
function profileIn(x: ProfileRecord): ProfileRecordDb {
    return {
        ...x,
        identifier: x.identifier.toText(),
    }
}
function profileOut(x: ProfileRecordDb): ProfileRecord {
    if (x.linkedCryptoID) {
        if (x.linkedCryptoID.type === 'ec_key') Object.setPrototypeOf(x.linkedCryptoID, ECKeyIdentifier.prototype)
        else throw new Error('Unknown type of linkedCryptoID')
    }
    return { ...x, identifier: Identifier.fromString(x.identifier) as PersonIdentifier }
}
function cryptoKeyRecordIn(x: CryptoIDRecord): CryptoIDRecordDb {
    return {
        ...x,
        identifier: x.identifier.toText(),
    }
}
function cryptoKeyRecordOut(x: CryptoIDRecordDb): CryptoIDRecord {
    for (const each of x.attachedProfiles) {
        Object.setPrototypeOf(each, PersonIdentifier.prototype)
    }
    return { ...x, identifier: Identifier.fromString(x.identifier) as CryptoIDIdentifier }
}
//#endregion
