import { readonlyMethodType, EthereumMethodType, ProviderType } from '@masknet/web3-shared-evm'
import Services from '#services'
import {
    type EIP2255PermissionRequest,
    MaskEthereumProviderRpcError as E,
    ErrorCode as C,
    ErrorMessages as M,
} from '@masknet/sdk'
import { Err, Ok } from 'ts-results-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import * as providers from /* webpackDefer: true */ '@masknet/web3-providers'

const readonlyMethods: Record<EthereumMethodType, (params: unknown[] | undefined) => Promise<unknown>> = {} as any
for (const method of readonlyMethodType) {
    readonlyMethods[method] = async (...params: unknown[]) => {
        return (await Services.Wallet.send({ jsonrpc: '2.0', method, params })).result
    }
}
// Reference:
// https://ethereum.github.io/execution-apis/api-documentation/
// https://docs.metamask.io/wallet/reference/eth_subscribe/
const methods = {
    ...readonlyMethods,

    async eth_chainId() {
        const chainId = await Services.Wallet.sdk_eth_chainId()
        return '0x' + chainId.toString(16)
    },
    async eth_accounts() {
        return Services.Wallet.sdk_eth_accounts(location.origin)
    },
    async eth_requestAccounts() {
        await Services.Wallet.requestUnlockWallet()
        let wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (wallets.length) return wallets
        const request = await methods.wallet_requestPermissions({ eth_accounts: {} })
        if (request instanceof Err) return request
        wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (wallets.length) return wallets
        return new E(C.UserRejectedTheRequest, M.UserRejectedTheRequest)
    },
    async personal_sign(challenge: string, requestedAddress: string) {
        // check challenge is 0x hex
        await Services.Wallet.requestUnlockWallet()
        const wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (!wallets.some((addr) => isSameAddress(addr, requestedAddress)))
            return new E(C.RequestedAccountHasNotBeenAuthorized, M.RequestedAccountHasNotBeenAuthorized)
        await providers.evm.state?.Message?.readyPromise
        return providers.EVMWeb3.getWeb3Provider({ providerType: ProviderType.MaskWallet }).request({
            method: EthereumMethodType.PERSONAL_SIGN,
            params: [challenge, requestedAddress],
        })
    },
    async eth_sendTransaction(options: any) {
        const wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (!wallets.some((addr) => isSameAddress(addr, options.from)))
            return new E(C.RequestedAccountHasNotBeenAuthorized, M.RequestedAccountHasNotBeenAuthorized)
        await providers.evm.state?.Message?.readyPromise
        return providers.EVMWeb3.getWeb3Provider({ providerType: ProviderType.MaskWallet }).request({
            method: EthereumMethodType.ETH_SEND_TRANSACTION,
            params: options,
        })
    },
    // https://eips.ethereum.org/EIPS/eip-2255
    wallet_getPermissions() {
        return Services.Wallet.sdk_EIP2255_wallet_getPermissions(location.origin)
    },
    async wallet_requestPermissions(request: EIP2255PermissionRequest) {
        if (typeof request !== 'object' || request === null) throw new E(C.InvalidParams, M.InvalidMethodParams)
        if (Object.keys(request).length === 0)
            throw new E(C.InvalidParams, M.wallet_requestPermissions_Empty.replaceAll('$', location.origin))
        for (const key in request) {
            if (typeof key !== 'string' || typeof request[key] !== 'object' || request[key] === null)
                throw new E(C.InvalidParams, M.wallet_requestPermissions_Unknown.replaceAll('$', location.origin))
        }
        return Services.Wallet.sdk_EIP2255_wallet_requestPermissions(location.origin, request)
    },
}
Object.setPrototypeOf(methods, null)

export async function eth_request(request: unknown): Promise<{ e?: E | null; d?: unknown }> {
    if (typeof request !== 'object' || request === null)
        return { e: new E(C.InvalidRequest, M.FirstArgumentIsNotObject) }

    const { method } = request as any
    if (typeof method !== 'string' || !method) return { e: new E(C.InvalidRequest, M.FirstArgumentMethodFieldInvalid) }
    if (!(method in methods)) return { e: new E(C.MethodNotFound, M.UnknownMethod.replaceAll('$', method)) }

    const { params } = request as any
    if (params !== undefined && !Array.isArray(params)) return { e: new E(C.InvalidRequest, M.ParamsIsNotArray) }

    const f = Reflect.get(methods, method)
    try {
        let result: unknown
        if (params === undefined) result = await f()
        else result = await f(...params)
        // TODO: async-rpc-call should be able to serialize error without touching it (by using the serializer defined)
        if (result instanceof Err) {
            if (result.error instanceof E) return { e: result.error }
            console.error(result)
            throw new Error('internal error')
        }
        if (result instanceof Ok) return { d: result.value }
        return { d: result }
    } catch (error) {
        if (error instanceof E) return { e: error }
        console.error(error)
        return { e: new E(C.InternalError, M.InternalError) }
    }
}
