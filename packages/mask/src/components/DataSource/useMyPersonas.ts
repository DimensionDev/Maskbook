import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared-base-ui'
import Services from '../../extension/service'
import { PersonaArrayComparer } from '../../utils/comparer'
import { MaskMessages } from '../../utils/messages'
import type { Persona } from '../../database'
import { debounce } from 'lodash-unified'

let isLoading: Promise<void> | null

const personas = new ValueRef<
    Pick<Persona, 'nickname' | 'identifier' | 'fingerprint' | 'publicHexKey' | 'linkedProfiles'>[]
>([], PersonaArrayComparer as any)

{
    async function query() {
        const p = await Services.Identity.queryMyPersonas()
        personas.value = p.filter((x) => !x.uninitialized)
        isLoading = null
        Services.Helper.__deprecated__setStorage<boolean>('mobileIsMyPersonasInitialized', personas.value.length > 0)
    }

    const debounceQuery = debounce(query, 500, { trailing: true })

    isLoading = query()
    MaskMessages.events.ownPersonaChanged.on(debounceQuery)
}

export function useMyPersonas() {
    if (isLoading) throw isLoading
    return useValueRef(personas)
}
