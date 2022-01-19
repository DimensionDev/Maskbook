import { first } from 'lodash-unified'
import { defer } from '@masknet/shared-base'
import Web3 from 'web3'
import type { RequestArguments } from 'web3-core'
import type { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers'
import { ChainId, EthereumMethodType, ProviderType } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../../../plugins/EVM/messages'
import { currentChainIdSettings, currentProviderSettings } from '../../../../plugins/Wallet/settings'
import { updateAccount } from '../../../../plugins/Wallet/services'

// #region redirect requests to the content page
let id = 0

async function request(requestArguments: RequestArguments) {
    id += 1
    const requestId = id
    const [deferred, resolve, reject] = defer<any, Error | null>()

    function onResponse({ payload, result, error }: EVM_Messages['INJECTED_PROVIDER_RPC_RESPONSE']) {
        if (payload.id !== requestId) return
        if (error) reject(error)
        else resolve(result)
    }

    setTimeout(
        () => reject(new Error('The request is timeout.')),
        requestArguments.method === EthereumMethodType.ETH_REQUEST_ACCOUNTS ? 3 * 60 * 1000 : 45 * 1000,
    )
    EVM_Messages.events.INJECTED_PROVIDER_RPC_RESPONSE.on(onResponse)
    EVM_Messages.events.INJECTED_PROVIDER_RPC_REQUEST.sendToVisiblePages({
        payload: {
            jsonrpc: '2.0',
            id: requestId,
            params: [],
            ...requestArguments,
        },
    })

    deferred.finally(() => {
        EVM_Messages.events.INJECTED_PROVIDER_RPC_RESPONSE.off(onResponse)
    })

    return deferred
}

function send(payload: JsonRpcPayload, callback: (error: Error | null, response?: JsonRpcResponse) => void) {
    request({
        method: payload.method,
        params: payload.params,
    })
        .then((result) => {
            callback(null, {
                id: payload.id as number,
                jsonrpc: '2.0',
                result,
            })
        })
        .catch((error) => {
            callback(error)
        })
}
// #endregion

let web3: Web3 | null = null

export function createProvider() {
    return {
        request,
        send,
        sendAsync: send,
    }
}

export function createWeb3() {
    if (web3) return web3
    web3 = new Web3(createProvider())
    return web3
}

export async function requestAccounts() {
    const web3 = createWeb3()
    const chainId = await web3.eth.getChainId()
    const accounts = await web3.eth.requestAccounts()
    return {
        chainId,
        accounts,
    }
}

export async function ensureConnectedAndUnlocked() {
    const web3 = createWeb3()
    try {
        const accounts = await web3.eth.requestAccounts()
        throw accounts
    } catch (error: string[] | any) {
        const accounts = error
        if (Array.isArray(accounts)) {
            if (accounts.length === 0) throw new Error('Injected Web3 is locked or it has not connected any accounts.')
            else if (accounts.length > 0) return // valid
        }
        // Any other error means failed to connect injected web3
        throw new Error('Failed to connect to injected Web3.')
    }
}

export async function onAccountsChanged(accounts: string[], providerType: ProviderType) {
    if (currentProviderSettings.value !== providerType) return
    await updateAccount({
        account: first(accounts),
        providerType,
    })
}

export async function onChainIdChanged(id: string, providerType: ProviderType) {
    if (currentProviderSettings.value !== providerType) return

    // learn more: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids and https://chainid.network/
    const chainId = Number.parseInt(id, 16) || ChainId.Mainnet
    if (currentChainIdSettings.value === chainId) return
    await updateAccount({
        chainId,
    })
}
