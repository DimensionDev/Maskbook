import { defer, type DeferTuple } from '@masknet/kit'
import type { ECKeyIdentifier } from '@masknet/shared-base'
import { walletDatabase } from '../database/Plugin.db.js'
import { produce } from 'immer'

export async function connectWalletToOrigin(wallet: string, origin: string) {
    assertOrigin(origin)
    const connectedOrigins = new Set((await walletDatabase.get('connected_origin', wallet))?.origins)
    if (connectedOrigins.has(origin)) return
    connectedOrigins.add(origin)
    await walletDatabase.add({ type: 'connected_origin', id: wallet, origins: connectedOrigins })
}
export async function disconnectWalletFromOrigin(wallet: string, origin: string) {
    assertOrigin(origin)
    const connectedOrigins = new Set((await walletDatabase.get('connected_origin', wallet))?.origins)
    if (!connectedOrigins.has(origin)) return
    connectedOrigins.delete(origin)
    if (connectedOrigins.size)
        await walletDatabase.add({ type: 'connected_origin', id: wallet, origins: connectedOrigins })
    else await walletDatabase.remove('connected_origin', wallet)
}
export async function disconnectAllWalletsFromOrigin(origin: string) {
    assertOrigin(origin)
    for await (const cursor of walletDatabase.iterate_mutate('connected_origin')) {
        if (!cursor.value.origins.has(origin)) continue
        if (cursor.value.origins.size === 1) await cursor.delete()
        else {
            await cursor.update(
                produce(cursor.value, (draft) => {
                    draft.origins.delete(origin)
                }),
            )
        }
    }
}
export async function disconnectAllOriginsConnectedFromWallet(wallet: string) {
    await walletDatabase.remove('connected_origin', wallet)
}
export async function isOriginConnectedToWallet(wallet: string, origin: string): Promise<boolean> {
    assertOrigin(origin)
    const connectedOrigins = await walletDatabase.get('connected_origin', wallet)
    return !!connectedOrigins?.origins.has(origin)
}
export async function getAllConnectedWallets(origin: string): Promise<ReadonlySet<string>> {
    assertOrigin(origin)
    const wallets = new Set<string>()
    for await (const cursor of walletDatabase.iterate('connected_origin')) {
        if (cursor.value.origins.has(origin)) wallets.add(cursor.value.id)
    }
    return wallets
}
export async function getAllConnectedOrigins(wallet: string): Promise<ReadonlySet<string>> {
    const connectedOrigins = await walletDatabase.get('connected_origin', wallet)
    return new Set(connectedOrigins?.origins)
}

function assertOrigin(origin: string) {
    if (!URL.canParse(origin) || new URL(origin).origin !== origin)
        throw new TypeError(
            'origin is not a valid origin. See https://developer.mozilla.org/en-US/docs/Glossary/Origin',
        )
}

interface MaskAccount {
    address: string
    owner?: string
    identifier?: ECKeyIdentifier
}

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
