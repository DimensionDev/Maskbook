import {
    type EIP2255PermissionRequest,
    type EIP2255Permission,
    type EIP2255RequestedPermission,
    MaskEthereumProviderRpcError,
    ErrorCode,
    ErrorMessages,
} from '@masknet/sdk'
import { walletDatabase } from '../database/Plugin.db.js'
import { produce, enableMapSet } from 'immer'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { openPopupWindow } from '../../helper/popup-opener.js'
import { EVMWalletProviders } from '@masknet/web3-providers'
import { PopupRoutes } from '@masknet/shared-base'
import { defer, type DeferTuple } from '@masknet/kit'
import type { WalletGrantedPermission } from '../database/types.js'
import { omit } from 'lodash-es'
import { Err, Ok, type Result } from 'ts-results-es'

// https://eips.ethereum.org/EIPS/eip-2255
export async function sdk_EIP2255_wallet_getPermissions(origin: string): Promise<EIP2255Permission[]> {
    const wallets = await getAllConnectedWallets(origin, 'sdk')
    if (!wallets.size) return []
    return EIP2255PermissionsOfWallets(origin, wallets)
}
const requests = new Map<
    string,
    {
        origin: string
        request: EIP2255PermissionRequest
        promise: DeferTuple<Result<EIP2255RequestedPermission[], MaskEthereumProviderRpcError>>
    }
>()
export async function sdk_EIP2255_wallet_requestPermissions(
    origin: string,
    request: EIP2255PermissionRequest,
): Promise<Result<EIP2255RequestedPermission[], MaskEthereumProviderRpcError>> {
    assertOrigin(origin)
    for (const method in request) {
        if (method !== 'eth_accounts') {
            throw new MaskEthereumProviderRpcError(
                ErrorCode.MethodNotFound,
                ErrorMessages.UnknownMethod.replaceAll('$', method),
            )
        }
    }
    const id = Math.random().toString(36).slice(2)
    requests.set(id, {
        origin,
        request,
        promise: defer(),
    })

    if (!EVMWalletProviders[ProviderType.MaskWallet].wallets) {
        await openPopupWindow(PopupRoutes.Wallet, { external_request: id })
    } else {
        await openPopupWindow(PopupRoutes.SelectWallet, {
            chainId: ChainId.Mainnet,
            external_request: id,
        })
    }
    return requests.get(id)!.promise[0]
}
export async function sdk_getEIP2255PermissionRequestDetail(id: string) {
    return omit(requests.get(id), 'promise')
}
export async function sdk_grantEIP2255Permission(id: string, grantedWalletAddress: Iterable<string>) {
    if (!requests.has(id)) throw new Error('Invalid request id')
    const { origin, promise } = requests.get(id)!
    enableMapSet()
    for (const wallet of grantedWalletAddress) {
        const data = await walletDatabase.get('granted_permission', wallet)
        const newData = produce<WalletGrantedPermission>(
            data || {
                type: 'granted_permission',
                id: wallet,
                origins: new Map(),
            },
            (draft) => {
                if (!draft.origins.has(origin)) draft.origins.set(origin, new Set())
                const permissions = draft.origins.get(origin)!
                if (Array.from(permissions).some((data) => hasEthAccountsPermission(origin, data))) return
                permissions.add({
                    invoker: origin,
                    parentCapability: 'eth_accounts',
                    caveats: [],
                })
            },
        )
        if (data !== newData) await walletDatabase.add(newData)
    }
    promise[1](Ok(EIP2255PermissionsOfWallets(origin, grantedWalletAddress)))
}

export async function sdk_denyEIP2255Permission(id: string) {
    if (!requests.has(id)) throw new Error('Invalid request id')
    const { promise } = requests.get(id)!
    enableMapSet()
    promise[1](
        Err(
            new MaskEthereumProviderRpcError(ErrorCode.UserRejectedTheRequest, ErrorMessages.user_rejected_the_request),
        ),
    )
}

export async function disconnectWalletFromOrigin(wallet: string, origin: string, type: 'any' | 'sdk' | 'internal') {
    assertOrigin(origin)
    if (type === 'any' || type === 'sdk') {
        const origins = new Map((await walletDatabase.get('granted_permission', wallet))?.origins)
        if (origins.has(origin)) {
            origins.delete(origin)
            if (origins.size) await walletDatabase.add({ type: 'granted_permission', id: wallet, origins })
            else await walletDatabase.remove('granted_permission', wallet)
        }
    }
    if (type === 'any' || type === 'internal') {
        const internalOrigins = new Set((await walletDatabase.get('internal_connected', wallet))?.origins)
        if (internalOrigins?.has(origin)) {
            internalOrigins.delete(origin)
            if (internalOrigins.size)
                await walletDatabase.add({ type: 'internal_connected', id: wallet, origins: internalOrigins })
            else await walletDatabase.remove('internal_connected', wallet)
        }
    }
}
export async function disconnectAllWalletsFromOrigin(origin: string, type: 'any' | 'sdk' | 'internal') {
    assertOrigin(origin)
    enableMapSet()
    if (type === 'any' || type === 'sdk') {
        for await (const cursor of walletDatabase.iterate_mutate('granted_permission')) {
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
    if (type === 'any' || type === 'internal') {
        for await (const cursor of walletDatabase.iterate_mutate('internal_connected')) {
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
}
export async function disconnectAllOriginsConnectedFromWallet(wallet: string, type: 'any' | 'sdk' | 'internal') {
    if (type === 'any' || type === 'sdk') await walletDatabase.remove('granted_permission', wallet)
    if (type === 'any' || type === 'internal') await walletDatabase.remove('internal_connected', wallet)
}

export async function internalWalletConnect(wallet: string, origin: string) {
    assertOrigin(origin)
    enableMapSet()
    const origins = (await walletDatabase.get('internal_connected', wallet))?.origins

    if (!origins) {
        walletDatabase.add({
            type: 'internal_connected',
            id: wallet,
            origins: new Set([origin]),
        })
    } else if (!origins.has(origin)) {
        for await (const cursor of walletDatabase.iterate_mutate('internal_connected')) {
            if (cursor.value.id !== wallet) continue
            await cursor.update(
                produce(cursor.value, (draft) => {
                    draft.origins.add(origin)
                }),
            )
        }
    }
}

function hasEthAccountsPermission(origin: string, permission: EIP2255Permission) {
    return permission.parentCapability === 'eth_accounts' && permission.invoker === origin
}
function EIP2255PermissionsOfWallets(origin: string, wallets: Iterable<string>): EIP2255Permission[] {
    return [
        {
            parentCapability: 'eth_accounts',
            invoker: origin,
            caveats: [
                {
                    type: 'restrictReturnedAccounts',
                    value: [...wallets],
                },
            ],
        },
    ]
}
export async function getAllConnectedWallets(
    origin: string,
    type: 'any' | 'sdk' | 'internal',
): Promise<ReadonlySet<string>> {
    assertOrigin(origin)
    const wallets = new Set<string>()
    if (type === 'any' || type === 'sdk') {
        out: for await (const cursor of walletDatabase.iterate('granted_permission')) {
            const thisOrigin = cursor.value.origins.get(origin)
            if (!thisOrigin) continue
            for (const permission of thisOrigin) {
                if (hasEthAccountsPermission(origin, permission)) {
                    wallets.add(cursor.value.id)
                    continue out
                }
            }
        }
    }

    if (type === 'any' || type === 'internal') {
        for await (const cursor of walletDatabase.iterate('internal_connected')) {
            if (!cursor.value.origins.has(origin)) continue
            wallets.add(cursor.value.id)
        }
    }
    return wallets
}
export async function getAllConnectedOrigins(
    wallet: string,
    type: 'any' | 'sdk' | 'internal',
): Promise<ReadonlySet<string>> {
    const connectedOrigins = new Set<string>()
    if (type === 'any' || type === 'sdk') {
        const origins = (await walletDatabase.get('granted_permission', wallet))?.origins || []
        out: for (const permissions of origins.values()) {
            for (const permission of permissions) {
                if (hasEthAccountsPermission(permission.invoker, permission)) {
                    connectedOrigins.add(permission.invoker)
                    continue out
                }
            }
        }
    }
    if (type === 'any' || type === 'internal') {
        const origins = (await walletDatabase.get('internal_connected', wallet))?.origins || []
        for (const origin of origins) {
            connectedOrigins.add(origin)
        }
    }
    return connectedOrigins
}

function assertOrigin(origin: string) {
    if (!URL.canParse(origin) || new URL(origin).origin !== origin)
        throw new TypeError(
            'origin is not a valid origin. See https://developer.mozilla.org/en-US/docs/Glossary/Origin',
        )
}
