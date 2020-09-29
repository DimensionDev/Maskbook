import { ValueRef } from '@holoflows/kit/es'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { ERC20TokenRecord } from '../database/types'
import { TokenArrayComparer } from '../helpers'
import { useWallet } from './useWallet'

//#region cache service query result
const tokensRef = new ValueRef<ERC20TokenRecord[]>([], TokenArrayComparer)

async function revalidate() {
    // tokens
    const tokens = await Services.Plugin.invokePlugin('maskbook.wallet', 'getTokens')
    tokensRef.value = tokens
}
PluginMessageCenter.on('maskbook.tokens.update', revalidate)
revalidate()
//#endregion

export function useAllTokens() {
    return useValueRef(tokensRef)
}

export function useTokens(address: string) {
    const wallet = useWallet(address)
    const tokens = useAllTokens()
    if (!wallet) return []
    return tokens.filter(
        (x) => wallet.erc20_token_whitelist.has(x.address) && !wallet.erc20_token_blacklist.has(x.address),
    )
}
