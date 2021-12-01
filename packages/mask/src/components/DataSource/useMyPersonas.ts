import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import Services from '../../extension/service'
import { PersonaArrayComparer } from '../../utils/comparer'
import { MaskMessages } from '../../utils/messages'
import type { Persona } from '../../database'
import { debounce } from 'lodash-unified'

let isLoading: Promise<void> | null

const independentRef = {
    myPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
}

{
    const query = () => {
        return Services.Identity.queryMyPersonas().then((p) => {
            independentRef.myPersonasRef.value = p.filter((x) => !x.uninitialized)
            isLoading = null
            Services.Helper.__deprecated__setStorage<boolean>(
                'mobileIsMyPersonasInitialized',
                independentRef.myPersonasRef.value.length > 0,
            )
        })
    }

    const debounceQuery = debounce(query, 500, { trailing: true })

    isLoading = query()
    MaskMessages.events.ownPersonaChanged.on(debounceQuery)
}

export function useMyPersonas() {
    if (isLoading) throw isLoading
    return useValueRef(independentRef.myPersonasRef)
}
