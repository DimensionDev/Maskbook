import * as bip39 from 'bip39'
import { validateMnemonic } from 'bip39'
import {
    personaRecordToPersona,
    queryAvatarDataURL,
    queryPersona as queryPersonaRAW,
    queryPostPagedDB,
    queryProfile,
    queryProfilesWithQuery,
    storeAvatar,
} from '../../database'
import {
    PersonaIdentifier,
    ProfileIdentifier,
    ECKeyIdentifierFromJsonWebKey,
    PersonaInformation,
    ProfileInformation,
    PostIVIdentifier,
} from '@masknet/shared-base'
import type { Persona, Profile } from '../../database/Persona/types'
import {
    attachProfileDB,
    queryPersonaDB,
    queryPersonasDB,
    queryRelationsPagedDB,
    LinkedProfileDetails,
    RelationRecord,
} from '../../../background/database/persona/db'
import { restoreNewIdentityWithMnemonicWord } from './WelcomeService'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { getCurrentPersonaIdentifier } from './SettingsService'
import { MaskMessages } from '../../utils'
import { first, orderBy } from 'lodash-unified'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { loginPersona } from '../../../background/services/identity/persona/update'

assertEnvironment(Environment.ManifestBackground)

export { validateMnemonic } from '../../utils/mnemonic-code'
export * from '../../../background/services/identity'

// #region Profile
export { queryProfile, queryProfilePaged, queryPersonaByProfile } from '../../database'

/** @deprecated */
export function queryProfiles(network?: string): Promise<Profile[]> {
    return queryProfilesWithQuery({ network })
}

export function queryProfilesWithIdentifiers(identifiers: ProfileIdentifier[]) {
    return queryProfilesWithQuery({ identifiers })
}
export async function queryMyProfiles(network?: string): Promise<Profile[]> {
    const myPersonas = (await queryMyPersonas(network)).filter((x) => !x.uninitialized)
    return Promise.all(
        myPersonas
            .flatMap((x) => Array.from(x.linkedProfiles.keys()))
            .filter((y) => !network || network === y.network)
            .map(queryProfile),
    )
}
// #endregion

// #region Persona
export { createPersonaByMnemonic, createPersonaByMnemonicV2, renamePersona } from '../../database'

/** @deprecated */
export async function queryPersona(
    identifier: PersonaIdentifier,
): Promise<
    Pick<
        Persona,
        | 'publicHexKey'
        | 'identifier'
        | 'hasPrivateKey'
        | 'mnemonic'
        | 'createdAt'
        | 'updatedAt'
        | 'linkedProfiles'
        | 'nickname'
    >
> {
    return queryPersonaRAW(identifier)
}

export async function queryPersonaByMnemonic(mnemonic: string, password: ''): Promise<PersonaIdentifier | null> {
    const verify = validateMnemonic(mnemonic)
    if (!verify) {
        throw new Error('Verify error')
    }

    const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonic, password)
    const identifier = ECKeyIdentifierFromJsonWebKey(key.privateKey)
    const persona = await queryPersonaDB(identifier, undefined, true)
    if (persona) {
        await loginPersona(persona.identifier)
        return persona.identifier
    }

    return null
}
export async function app_only_queryPersonas(identifier?: PersonaIdentifier, requirePrivateKey = false) {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')
    return queryPersonas_inner(identifier, requirePrivateKey)
}
async function queryPersonas_inner(identifier?: PersonaIdentifier, requirePrivateKey = false): Promise<Persona[]> {
    if (typeof identifier === 'undefined')
        return (await queryPersonasDB({ hasPrivateKey: requirePrivateKey })).map(personaRecordToPersona)
    const x = await queryPersonaDB(identifier)
    if (!x || (!x.privateKey && requirePrivateKey)) return []
    return [personaRecordToPersona(x)]
}

export async function queryMyPersonas(
    network?: string,
): Promise<
    Pick<
        Persona,
        | 'nickname'
        | 'identifier'
        | 'fingerprint'
        | 'publicHexKey'
        | 'linkedProfiles'
        | 'uninitialized'
        | 'createdAt'
        | 'hasPrivateKey'
        | 'updatedAt'
    >[]
> {
    const x = await queryPersonas_inner(undefined, true)
    if (typeof network === 'string') {
        return x.filter((y) => {
            for (const z of y.linkedProfiles.keys()) {
                if (z.network === network) return true
            }
            return false
        })
    }
    return x
}

export async function queryLastPersonaCreated(): Promise<PersonaIdentifier | undefined> {
    const all = await queryPersonas_inner(undefined, true)
    return first(orderBy(all, (x) => x.createdAt, 'desc'))?.identifier
}

export async function queryOwnedPersonaInformation(): Promise<PersonaInformation[]> {
    const personas = await queryPersonas_inner(undefined, true)
    const result: PersonaInformation[] = []
    for (const persona of personas.sort((a, b) => (a.updatedAt > b.updatedAt ? 1 : -1))) {
        const map: ProfileInformation[] = []
        result.push({
            nickname: persona.nickname,
            identifier: persona.identifier,
            linkedProfiles: map,
            publicHexKey: persona.publicHexKey,
        })
        for (const [profile] of persona.linkedProfiles) {
            const linkedProfile = await queryProfile(profile)

            map.push({ identifier: profile, nickname: linkedProfile.nickname, avatar: linkedProfile.avatar })
        }
    }
    return result
}
export async function mobile_restoreFromMnemonicWords(
    mnemonicWords: string,
    nickname: string,
    password: string,
): Promise<Persona> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in mobile')
    if (!bip39.validateMnemonic(mnemonicWords)) throw new Error('the mnemonic words are not valid')
    const identifier = await restoreNewIdentityWithMnemonicWord(mnemonicWords, password, {
        nickname,
    })

    return queryPersonaRAW(identifier)
}
// #endregion

// #region Profile & Persona
/**
 * Remove an identity.
 */
export async function attachProfile(
    source: ProfileIdentifier,
    target: ProfileIdentifier | PersonaIdentifier,
    data: LinkedProfileDetails,
): Promise<void> {
    if (target instanceof ProfileIdentifier) {
        const profile = await queryProfile(target)
        if (!profile.linkedPersona) throw new Error('target not found')
        target = profile.linkedPersona.identifier
    }
    return attachProfileDB(source, target, data)
}
export { detachProfileDB as detachProfile } from '../../../background/database/persona/db'
// #endregion

// #region Post
export { queryPostsDB } from '../../database'

export async function queryPagedPostHistory(
    options: {
        network: string
        userIds: string[]
        after?: PostIVIdentifier
        pageOffset?: number
    },
    count: number,
) {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryPostPagedDB(currentPersona, options, count)
    }

    return []
}
// #endregion

// #region Relation
export async function queryRelationPaged(
    options: {
        network: string
        after?: RelationRecord
        pageOffset?: number
    },
    count: number,
): Promise<RelationRecord[]> {
    const currentPersona = await getCurrentPersonaIdentifier()
    if (currentPersona) {
        return queryRelationsPagedDB(currentPersona, options, count)
    }

    return []
}
// #endregion

// #region avatar
export async function updateCurrentPersonaAvatar(avatar: Blob) {
    const identifier = await getCurrentPersonaIdentifier()

    if (identifier) {
        await storeAvatar(identifier, await avatar.arrayBuffer())
        MaskMessages.events.ownPersonaChanged.sendToAll(undefined)
    }
}

export async function getCurrentPersonaAvatar() {
    const identifier = await getCurrentPersonaIdentifier()
    if (!identifier) return null

    try {
        return await queryAvatarDataURL(identifier)
    } catch {
        return null
    }
}
// #endregion
