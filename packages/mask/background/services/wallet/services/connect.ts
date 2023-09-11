import {
    type EIP2255PermissionRequest,
    type EIP2255Permission,
    type EIP2255RequestedPermission,
    MaskEthereumProviderRpcError,
    ErrorCode,
    ErrorMessages,
} from '@masknet/sdk'
import { walletDatabase } from '../database/Plugin.db.js'
import { produce } from 'immer'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { openPopupWindow } from '../../helper/popup-opener.js'
import { Providers } from '@masknet/web3-providers'
import { PopupRoutes } from '@masknet/shared-base'
import { defer, type DeferTuple } from '@masknet/kit'
import type { WalletGrantedPermission } from '../database/types.js'
import { omit } from 'lodash-es'

// https://eips.ethereum.org/EIPS/eip-2255
export async function EIP2255_wallet_getPermissions(origin: string): Promise<EIP2255Permission[]> {
    const wallets = await getAllConnectedWallets(origin)
    if (!wallets.size) return []
    return EIP2255PermissionsOfWallets(origin, wallets)
}
const requests = new Map<
    string,
    {
        origin: string
        request: EIP2255PermissionRequest
        promise: DeferTuple<EIP2255RequestedPermission[], MaskEthereumProviderRpcError>
    }
>()
export async function EIP2255_wallet_requestPermissions(
    origin: string,
    request: EIP2255PermissionRequest,
): Promise<EIP2255RequestedPermission[]> {
    assertOrigin(origin)
    for (const method in request) {
        if (method !== 'eth_accounts') {
            throw new MaskEthereumProviderRpcError(
                ErrorCode.MethodNotFound,
                ErrorMessages.UnknownMethod.replace('$', method),
            )
        }
    }
    if (!Providers[ProviderType.MaskWallet].wallets) {
        await openPopupWindow(PopupRoutes.Wallet)
        // TODO: we should connet the flow so that user can create a newly created wallet.
        throw new MaskEthereumProviderRpcError(ErrorCode.InternalError, 'Wallet not created.')
    }
    const id = Math.random().toString(36).slice(2)
    requests.set(id, {
        origin,
        request,
        promise: defer(),
    })
    await openPopupWindow(PopupRoutes.SelectWallet, {
        chainId: ChainId.Mainnet,
        external_request: id,
    })
    return requests.get(id)!.promise[0]
}
export async function getEIP2255PermissionDetail(id: string) {
    return omit(requests.get(id), 'promise')
}
export async function grantEIP2255Permission(id: string, grantedWalletAddress: Iterable<string>) {
    if (!requests.has(id)) throw new Error('Invalid request id')
    const { origin, request, promise } = requests.get(id)!
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
    promise[1](EIP2255PermissionsOfWallets(origin, grantedWalletAddress))
}

export async function disconnectWalletFromOrigin(wallet: string, origin: string) {
    assertOrigin(origin)
    const origins = new Map((await walletDatabase.get('granted_permission', wallet))?.origins)
    if (!origins.has(origin)) return
    origins.delete(origin)
    if (origins.size) await walletDatabase.add({ type: 'granted_permission', id: wallet, origins })
    else await walletDatabase.remove('granted_permission', wallet)
}
export async function disconnectAllWalletsFromOrigin(origin: string) {
    assertOrigin(origin)
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
export async function disconnectAllOriginsConnectedFromWallet(wallet: string) {
    await walletDatabase.remove('granted_permission', wallet)
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
export async function isOriginConnectedToWallet(wallet: string, origin: string): Promise<boolean> {
    assertOrigin(origin)
    const permissions = (await walletDatabase.get('granted_permission', wallet))?.origins.get(origin)
    if (!permissions) return false
    for (const permission of permissions) {
        if (hasEthAccountsPermission(origin, permission)) return true
    }
    return false
}
export async function getAllConnectedWallets(origin: string): Promise<ReadonlySet<string>> {
    assertOrigin(origin)
    const wallets = new Set<string>()
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
    return wallets
}
export async function getAllConnectedOrigins(wallet: string): Promise<ReadonlySet<string>> {
    const origins = (await walletDatabase.get('granted_permission', wallet))?.origins
    const connectedOrigins = new Set<string>()
    if (!origins) return connectedOrigins
    out: for (const permissions of origins.values()) {
        for (const permission of permissions) {
            if (hasEthAccountsPermission(permission.invoker, permission)) {
                connectedOrigins.add(permission.invoker)
                continue out
            }
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
