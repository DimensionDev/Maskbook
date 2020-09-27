import { ValueRef } from '@holoflows/kit/es'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { ERC20TokenRecord } from '../database/types'
import { TokenArrayComparer } from '../helpers'

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

export function useTokens() {
    return useValueRef(tokensRef)
}
