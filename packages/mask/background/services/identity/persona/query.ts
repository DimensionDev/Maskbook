import { first, omit, orderBy } from 'lodash-es'
import {
    ECKeyIdentifier,
    type EC_Public_JsonWebKey,
    fromBase64URL,
    isEC_Private_JsonWebKey,
    type NextIDPlatform,
    type PersonaIdentifier,
    type PersonaInformation,
    type ProfileIdentifier,
    type SocialIdentity,
} from '@masknet/shared-base'
import type { IdentityResolved } from '@masknet/plugin-infra'
import { NextIDProof } from '@masknet/web3-providers'
import {
    createPersonaDBReadonlyAccess,
    queryPersonaDB,
    queryPersonasDB,
    queryProfileDB,
} from '../../../database/persona/db.js'
import { toPersonaInformation } from '../../__utils__/convert.js'
import * as bip39 from 'bip39'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from './utils.js'
import { bytesToHex, privateToPublic, publicToAddress } from '@ethereumjs/util'
import { decode } from '@msgpack/msgpack'
import { decodeArrayBuffer } from '@masknet/kit'

export async function queryOwnedPersonaInformation(initializedOnly: boolean): Promise<PersonaInformation[]> {
    let result: Promise<PersonaInformation[]>
    await createPersonaDBReadonlyAccess(async (t) => {
        let personas = await queryPersonasDB({ hasPrivateKey: true }, t)
        if (initializedOnly) personas = personas.filter((x) => !x.uninitialized)
        result = toPersonaInformation(personas, t).mustNotAwaitThisWithInATransaction
    })
    return result!
}

export async function queryLastPersonaCreated(): Promise<PersonaIdentifier | undefined> {
    const all = await queryPersonasDB({ hasPrivateKey: true })
    return first(orderBy(all, (x) => x.createdAt, 'desc'))?.identifier
}

export async function queryPersonaByProfile(id: ProfileIdentifier): Promise<PersonaInformation | undefined> {
    let result: Promise<PersonaInformation> | undefined
    await createPersonaDBReadonlyAccess(async (t) => {
        const profile = await queryProfileDB(id, t)
        if (!profile?.linkedPersona) return
        const persona = await queryPersonaDB(profile.linkedPersona, t)
        if (!persona) return
        result = toPersonaInformation([persona], t).mustNotAwaitThisWithInATransaction.then((x) => first(x)!)
    })
    return result
}

export async function queryPersona(id: PersonaIdentifier): Promise<undefined | PersonaInformation> {
    let result: Promise<PersonaInformation> | undefined
    await createPersonaDBReadonlyAccess(async (t) => {
        const persona = await queryPersonaDB(id, t)
        if (!persona) return
        result = toPersonaInformation([persona], t).mustNotAwaitThisWithInATransaction.then((x) => first(x)!)
    })
    return result
}

export async function queryPersonaEOAByMnemonic(mnemonicWord: string, password: string) {
    const verify = bip39.validateMnemonic(mnemonicWord)
    if (!verify) throw new Error('Verify error')

    const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonicWord, password)
    const { privateKey, publicKey } = key

    if (!privateKey.d) return
    return {
        address: bytesToHex(publicToAddress(privateToPublic(fromBase64URL(privateKey.d)))),
        identifier: (await ECKeyIdentifier.fromJsonWebKey(publicKey)).unwrap(),
        publicKey,
    }
}

export async function queryPersonaEOAByPrivateKey(privateKeyString: string) {
    const privateKey = decode(decodeArrayBuffer(privateKeyString))

    if (!isEC_Private_JsonWebKey(privateKey) || !privateKey.d) throw new TypeError('Invalid private key')
    const publicKey = omit(privateKey, 'd') as EC_Public_JsonWebKey
    return {
        address: bytesToHex(publicToAddress(privateToPublic(fromBase64URL(privateKey.d)))),
        identifier: (await ECKeyIdentifier.fromJsonWebKey(publicKey)).unwrap(),
        publicKey,
    }
}

export async function queryPersonasFromNextID(platform: NextIDPlatform, identityResolved: IdentityResolved) {
    if (!identityResolved.identifier) return
    return NextIDProof.queryAllExistedBindingsByPlatform(platform, identityResolved.identifier.userId)
}

export async function querySocialIdentity(
    platform: NextIDPlatform,
    identity: IdentityResolved | undefined,
): Promise<SocialIdentity | undefined> {
    if (!identity?.identifier) return
    const persona = await queryPersonaByProfile(identity.identifier)
    if (!persona) return identity

    const bindings = await queryPersonasFromNextID(platform, identity)
    if (!bindings) return identity

    const personaBindings =
        bindings?.filter((x) => x.persona === persona?.identifier.publicKeyAsHex.toLowerCase()) ?? []
    return {
        ...identity,
        publicKey: persona?.identifier.publicKeyAsHex,
        hasBinding: personaBindings.length > 0,
        binding: first(personaBindings),
    }
}

export { queryPersonaDB } from '../../../database/persona/db.js'
