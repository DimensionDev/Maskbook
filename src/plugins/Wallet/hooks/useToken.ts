import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import { PluginMessageCenter } from '../../PluginMessages'
import Services from '../../../extension/service'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import type { ERC20TokenRecord } from '../database/types'
import { TokenArrayComparer } from '../helpers'
import { useWallet } from './useWallet'
import { EthereumAddress } from 'wallet.ts'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { isSameAddress } from '../../../web3/helpers'
import { EthereumTokenType, Token } from '../../../web3/types'

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

/**
 * Fetch all tokens from DB
 */
export function useAllTokens(): Token[] {
    const ETH_ADDRESS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    const records = useValueRef(tokensRef)
    return records.map((x) => ({
        type: isSameAddress(ETH_ADDRESS, x.address) ? EthereumTokenType.Ether : EthereumTokenType.ERC20,
        ...x,
    }))
}

/**
 * Fetch tokens owned by a wallet from DB
 * @param address
 */
export function useTokens(address: string) {
    const wallet = useWallet(address)
    const tokens = useAllTokens()
    if (!EthereumAddress.isValid(address)) return []
    if (!wallet) return []
    return tokens.filter(
        (x) => wallet.erc20_token_whitelist.has(x.address) && !wallet.erc20_token_blacklist.has(x.address),
    )
}
