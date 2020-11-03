import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import Services from '../../extension/service'
import { PersonaArrayComparer } from '../../utils/comparer'
import { MessageCenter } from '../../utils/messages'
import type { Persona } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { sideEffect } from '../../utils/side-effects'
import { debounce } from 'lodash-es'

const independentRef = {
    myPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
    myUninitializedPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
}

{
    const query = debounce(
        () => {
            Services.Identity.queryMyPersonas().then((p) => {
                independentRef.myPersonasRef.value = p.filter((x) => !x.uninitialized)
                independentRef.myUninitializedPersonasRef.value = p.filter((x) => x.uninitialized)
            })
        },
        500,
        {
            trailing: true,
        },
    )
    sideEffect.then(query)
    MessageCenter.on('personaUpdated', query)
}

export function useMyPersonas() {
    return useValueRef(independentRef.myPersonasRef)
}

export function useMyUninitializedPersonas() {
    return useValueRef(independentRef.myUninitializedPersonasRef)
}
