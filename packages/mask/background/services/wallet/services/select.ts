import { defer, type DeferTuple } from '@masknet/kit'
import { PopupRoutes, type ECKeyIdentifier } from '@masknet/shared-base'
import { ProviderType, type ChainId } from '@masknet/web3-shared-evm'
import { openPopupWindow } from '../../helper/popup-opener.js'
import { Providers } from '@masknet/web3-providers'

let deferred: DeferTuple<MaskAccount[], Error> | undefined

export interface MaskAccount {
    address: string
    owner?: string
    identifier?: ECKeyIdentifier
}
/**
 * @param chainId Chain ID
 */
export async function selectMaskAccount(chainId: ChainId): Promise<MaskAccount[]> {
    await openPopupWindow(Providers[ProviderType.MaskWallet].wallets ? PopupRoutes.SelectWallet : PopupRoutes.Wallet, {
        chainId,
    })
    deferred = defer()
    return deferred![0]
}

export async function resolveMaskAccount(result: MaskAccount[] | PromiseSettledResult<MaskAccount[]>) {
    if (Array.isArray(result)) deferred?.[1](result)
    else if (result.status === 'fulfilled') deferred?.[1](result.value)
    else deferred?.[2](result.reason)

    deferred = undefined
}
