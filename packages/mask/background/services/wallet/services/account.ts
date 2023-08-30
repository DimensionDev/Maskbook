import { defer, type DeferTuple } from '@masknet/kit'
import type { ECKeyIdentifier, EnhanceableSite, ExtensionSite } from '@masknet/shared-base'

const recordSites = new Map<EnhanceableSite | ExtensionSite, boolean>()

export async function recordConnectedSites(site: EnhanceableSite | ExtensionSite, connected: boolean) {
    recordSites.set(site, connected)
}

export async function getConnectedStatus(site: EnhanceableSite | ExtensionSite) {
    return recordSites.get(site)
}

export async function disconnectAll() {
    return recordSites.clear()
}

export async function getConnectedSites() {
    return [...recordSites.entries()].filter(([, connected]) => connected).map(([site]) => site)
}

interface MaskAccount {
    address: string
    owner?: string
    identifier?: ECKeyIdentifier
}

// #region select wallet with popups
let deferred: DeferTuple<MaskAccount[], Error> | null

export async function selectMaskAccount(): Promise<MaskAccount[]> {
    const [promise] = (deferred = defer())
    return promise
}

export async function resolveMaskAccount(accounts: MaskAccount[]) {
    deferred?.[1](accounts)
    deferred = null
}

export async function rejectMaskAccount() {
    deferred?.[1]([])
    deferred = null
}
// #endregion
