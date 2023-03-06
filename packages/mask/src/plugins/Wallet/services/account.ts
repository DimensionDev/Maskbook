import { defer, DeferTuple } from '@masknet/kit'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { EnhanceableSite, ExtensionSite } from '@masknet/web3-shared-base'

const recordSites = new Map<EnhanceableSite | ExtensionSite, boolean>()

export async function recordConnectedSites(site: EnhanceableSite | ExtensionSite, connected: boolean) {
    recordSites.set(site, connected)
}

export async function getConnectedStatus(site: EnhanceableSite | ExtensionSite) {
    return recordSites.get(site)
}

interface MaskAccount {
    address: string
    owner?: string
    identifier?: ECKeyIdentifier
}
// #region select wallet with popups
let deferred: DeferTuple<MaskAccount[], Error> | null

export async function selectMaskAccount(): Promise<MaskAccount[]> {
    deferred = defer()
    return deferred?.[0] ?? []
}

export async function resolveMaskAccount(accounts: MaskAccount[]) {
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
