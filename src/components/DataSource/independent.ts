import { ValueRef } from '@holoflows/kit/es'
import Services from '../../extension/service'
import { PersonaArrayComparer } from '../../utils/comparer'
import { MessageCenter } from '../../utils/messages'
import type { Persona } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import type { WalletRecord, ERC20TokenRecord } from '../../plugins/Wallet/database/types'
import { sideEffect } from '../../utils/side-effects'
import { currentEthereumNetworkSettings } from '../../plugins/Wallet/UI/Developer/EthereumNetworkSettings'

const independentRef = {
    myPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
    myUninitializedPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
}

{
    const ref = sideEffect.then(query)
    MessageCenter.on('personaUpdated', query)
    function query() {
        Services.Identity.queryMyPersonas().then((p) => {
            independentRef.myPersonasRef.value = p.filter((x) => !x.uninitialized)
            independentRef.myUninitializedPersonasRef.value = p.filter((x) => x.uninitialized)
        })
    }
}

export function useMyPersonas() {
    return useValueRef(independentRef.myPersonasRef)
}

export function useMyUninitializedPersonas() {
    return useValueRef(independentRef.myUninitializedPersonasRef)
}
