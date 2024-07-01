import { PopupRoutes, type ECKeyIdentifier } from '@masknet/shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { openPopupWindow } from '../../helper/popup-opener.js'

let deferred: PromiseWithResolvers<MaskAccount[]> | undefined

interface MaskAccount {
    address: string
    owner?: string
    identifier?: ECKeyIdentifier
}
/**
 * @param chainId Chain ID
 */
export async function selectMaskAccount(
    chainId: ChainId,
    defaultAddress?: string,
    source?: string,
): Promise<MaskAccount[]> {
    await openPopupWindow(PopupRoutes.SelectWallet, {
        chainId,
        address: defaultAddress,
        source,
    })
    deferred = Promise.withResolvers()
    return deferred.promise
}

export async function resolveMaskAccount(result: MaskAccount[] | PromiseSettledResult<MaskAccount[]>) {
    if (Array.isArray(result)) deferred?.resolve(result)
    else if (result.status === 'fulfilled') deferred?.resolve(result.value)
    else deferred?.reject(result.reason)

    deferred = undefined
}
