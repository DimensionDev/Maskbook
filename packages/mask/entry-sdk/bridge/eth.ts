import { readonlyMethodType, type EthereumMethodType } from '@masknet/web3-shared-evm'
import Services from '#services'
import type { EIP2255PermissionRequest } from '@masknet/sdk'
import { MaskEthereumProviderRpcError as E, ErrorCode as C, ErrorMessages as M } from '@masknet/sdk'

const readonlyMethods: Record<EthereumMethodType, (params: unknown[] | undefined) => Promise<unknown>> = {} as any
for (const method of readonlyMethodType) {
    readonlyMethods[method] = async (params: unknown[] | undefined) => {
        return Services.Wallet.send({ jsonrpc: '2.0', method, params })
    }
}
// Reference:
// https://ethereum.github.io/execution-apis/api-documentation/
// https://docs.metamask.io/wallet/reference/eth_subscribe/
const methods = {
    ...readonlyMethods,

    // https://eips.ethereum.org/EIPS/eip-2255
    wallet_getPermissions() {
        return Services.Wallet.EIP2255_wallet_getPermissions(location.origin)
    },
    async wallet_requestPermissions(request: EIP2255PermissionRequest) {
        if (typeof request !== 'object' || request === null) throw new E(C.InvalidParams, M.InvalidMethodParams)
        if (Object.keys(request).length === 0)
            throw new E(C.InvalidParams, M.wallet_requestPermissions_Empty.replaceAll('$', location.origin))
        for (const key in request) {
            if (typeof key !== 'string' || typeof request[key] !== 'object' || request[key] === null)
                throw new E(C.InvalidParams, M.wallet_requestPermissions_Unknown.replaceAll('$', location.origin))
        }
        return Services.Wallet.EIP2255_wallet_requestPermissions(location.origin, request)
    },
}
Object.setPrototypeOf(methods, null)

export async function eth_request(request: unknown) {
    if (typeof request !== 'object' || request === null) throw new E(C.InvalidRequest, M.FirstArgumentIsNotObject)

    const { method } = request as any
    if (typeof method !== 'string' || !method) throw new E(C.InvalidRequest, M.FirstArgumentMethodFieldInvalid)
    if (!(method in methods)) throw new E(C.MethodNotFound, M.UnknownMethod.replaceAll('$', method))

    const { params } = request as any
    if (params !== undefined && !Array.isArray(params)) throw new E(C.InvalidRequest, M.ParamsIsNotArray)

    const f = Reflect.get(methods, method)
    return f(...params)
}
