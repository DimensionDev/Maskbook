import { LanguageOptions } from '@masknet/public-api'
import { ECKeyIdentifier, PersonaIdentifier } from '@masknet/shared-base'
import { head } from 'lodash-unified'
import { queryPersonasDB } from '../../database/persona/db'
import { getBrowserStorageUnchecked, InternalStorageKeys } from './utils'

export async function getLanguagePreference(): Promise<LanguageOptions> {
    const raw = String(await getBrowserStorageUnchecked(InternalStorageKeys.language))

    if (Object.values(LanguageOptions).some((x) => x === raw)) return raw as LanguageOptions
    return LanguageOptions.__auto__
}

// Note: this version does not set new current persona if it's not found because infra of settings has not migrated yet.
export async function getCurrentPersonaIdentifier_alternative(): Promise<PersonaIdentifier | undefined> {
    const raw = ECKeyIdentifier.from(String(await getBrowserStorageUnchecked(InternalStorageKeys.currentPersona)))

    if (raw.some) return raw.val

    const id = head(
        (await queryPersonasDB({ hasPrivateKey: true }))
            .sort((a, b) => (a.createdAt > b.createdAt ? 1 : 0))
            .map((x) => x.identifier),
    )
    return id
}
