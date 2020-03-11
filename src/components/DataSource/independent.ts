import { ValueRef } from '@holoflows/kit/es'
import Services from '../../extension/service'
import { PersonaArrayComparer } from '../../utils/comparer'
import { MessageCenter } from '../../utils/messages'
import { Persona } from '../../database'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { PluginMessageCenter } from '../../plugins/PluginMessages'
import { currentEthereumNetworkSettings } from '../../plugins/Wallet/network'
import { WalletRecord, ERC20TokenRecord } from '../../plugins/Wallet/database/types'

const independentRef = {
    myPersonasRef: new ValueRef<Persona[]>([], PersonaArrayComparer),
    // TODO: typeonly import
    walletTokenRef: new ValueRef<[(WalletRecord & { privateKey: string })[], ERC20TokenRecord[]]>([[], []]),
}

{
    const ref = independentRef.myPersonasRef
    query()
    MessageCenter.on('personaUpdated', query)
    function query() {
        Services.Identity.queryMyPersonas().then(p => (ref.value = p))
    }
}

{
    const ref = independentRef.walletTokenRef
    query()
    PluginMessageCenter.on('maskbook.wallets.update', query)
    currentEthereumNetworkSettings.addListener(query)
    function query() {
        Services.Plugin.invokePlugin('maskbook.wallet', 'getWallets').then(x => (ref.value = x))
    }
}

export function useMyPersonas() {
    return useValueRef(independentRef.myPersonasRef)
}

export function useMyWallets() {
    return useValueRef(independentRef.walletTokenRef)
}
