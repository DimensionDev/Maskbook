import { defer, type DeferTuple } from '@masknet/kit'
import type { ECKeyIdentifier, EnhanceableSite, ExtensionSite } from '@masknet/shared-base'

const recordSites = new Map<EnhanceableSite | ExtensionSite, boolean>()

export async function recordConnectedSites(site: EnhanceableSite | ExtensionSite, connected: boolean) {
    recordSites.set(site, connected)
}

export async function getConnectedStatus(site: EnhanceableSite | ExtensionSite) {
    return recordSites.get(site)
}

// #region select wallet with popups
let deferred: DeferTuple<
    Array<{
        address: string
        owner?: string
        identifier?: ECKeyIdentifier
    }>,
    Error
> | null

export async function selectMaskAccount(): Promise<
    Array<{
        address: string
        owner?: string
        identifier?: ECKeyIdentifier
    }>
> {
    deferred = defer()
    return deferred?.[0] ?? []
}

export async function resolveMaskAccount(
    accounts: Array<{
        address: string
        owner?: string
        identifier?: ECKeyIdentifier
    }>,
) {
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
