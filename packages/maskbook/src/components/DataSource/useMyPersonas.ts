import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import Services from '../../extension/service'
import { PersonaArrayComparer } from '../../utils/comparer'
import { MaskMessage } from '../../utils/messages'
import type { Persona } from '../../database'
import { debounce } from 'lodash-es'

let isLoading: Promise<void> | null

const independentRef = {
    myPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
    myUninitializedPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
}

{
    const query = () => {
        return Services.Identity.queryMyPersonas().then((p) => {
            independentRef.myPersonasRef.value = p.filter((x) => !x.uninitialized)
            independentRef.myUninitializedPersonasRef.value = p.filter((x) => x.uninitialized)
            isLoading = null
            Services.Helper.setStorage<boolean>(
                'mobileIsMyPersonasInitialized',
                independentRef.myPersonasRef.value.length > 0,
            )
        })
    }

    const debounceQuery = debounce(query, 500, { trailing: true })

    isLoading = query()
    MaskMessage.events.personaChanged.on((x) => x.some((x) => x.owned) && debounceQuery())
}

export function useMyPersonas() {
    if (isLoading) throw isLoading
    return useValueRef(independentRef.myPersonasRef)
}

export function useMyUninitializedPersonas() {
    if (isLoading) throw isLoading
    return useValueRef(independentRef.myUninitializedPersonasRef)
}
