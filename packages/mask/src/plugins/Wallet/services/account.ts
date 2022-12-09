import { defer, DeferTuple } from '@masknet/kit'
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { ChainId, isValidAddress } from '@masknet/web3-shared-evm'
import {
    currentMaskWalletAccountSettings,
    currentMaskWalletChainIdSettings,
} from '../../../../shared/legacy-settings/wallet-settings.js'

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
