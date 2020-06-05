import { ValueRef } from '@holoflows/kit/es'
import Services from '../../extension/service'
import { PersonaArrayComparer } from '../../utils/comparer'
import { MessageCenter } from '../../utils/messages'
import type { Persona } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import type { WalletRecord, ERC20TokenRecord } from '../../plugins/Wallet/database/types'
import { sideEffect } from '../../utils/side-effects'
import { currentEthereumNetworkSettings } from '../../plugins/Wallet/UI/Developer/SelectEthereumNetwork'

const independentRef = {
    myPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
    walletTokenRef: new ValueRef<[(WalletRecord & { privateKey: string })[], ERC20TokenRecord[]]>([[], []]),
}

{
    const ref = independentRef.myPersonasRef
    sideEffect.then(query)
    MessageCenter.on('personaUpdated', query)
    function query() {
        Services.Identity.queryMyPersonas().then((p) => (ref.value = p))
    }
}

{
    const ref = independentRef.walletTokenRef
    sideEffect.then(query)
    PluginMessageCenter.on('maskbook.wallets.update', query)
    currentEthereumNetworkSettings.addListener(query)
    function query() {
        Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets').then((x) => (ref.value = x))
    }
}

export function useMyPersonas() {
    return useValueRef(independentRef.myPersonasRef)
}

export function useMyWallets() {
    return useValueRef(independentRef.walletTokenRef)
}
