import { first } from 'lodash-es'
import { defer, DeferTuple } from '@masknet/kit'
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { ChainId, isValidAddress } from '@masknet/web3-shared-evm'
import {
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
} from '../../../../shared/legacy-settings/wallet-settings.js'
import { WalletRPC } from '../messages.js'

export async function setDefaultMaskAccount() {
    if (currentMaskWalletAccountSettings.value) return
    const wallets = await WalletRPC.getWallets()
    const address = first(wallets)?.address
    if (!address) return
    await updateMaskAccount({
        account: address,
    })
}

export async function updateMaskAccount(options: { account?: string; chainId?: ChainId }) {
    const { account, chainId } = options
    if (chainId) currentMaskWalletChainIdSettings.value = chainId
    if (isValidAddress(account)) {
        currentMaskWalletAccountSettings.value = account
        await resolveMaskAccount([account])
    }
}

const recordSites = new Map<EnhanceableSite | ExtensionSite, boolean>()

export async function recordConnectedSites(site: EnhanceableSite | ExtensionSite, connected: boolean) {
    recordSites.set(site, connected)
}

export async function getConnectedStatus(site: EnhanceableSite | ExtensionSite) {
    return recordSites.get(site)
}

// #region select wallet with popups
let deferred: DeferTuple<string[], Error> | null

export async function selectMaskAccount(): Promise<string[]> {
    deferred = defer()
    return deferred?.[0] ?? []
}

export async function resolveMaskAccount(accounts: string[]) {
    const [, resolve] = deferred ?? []
    resolve?.(accounts)
    deferred = null
}

export async function rejectMaskAccount() {
    const [, resolve] = deferred ?? []
    resolve?.([])
    deferred = null
}
// #endregion
