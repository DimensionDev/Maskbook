import { MaskEthereumProviderRpcError, type BridgeAPI } from '@masknet/sdk'
import { SignType } from '@masknet/shared-base'
import Services from '../../service.js'
import { SiteMethods } from './site_context.js'
import { readonlyMethodType, type EthereumMethodType } from '@masknet/web3-shared-evm'

export const maskSDKServer: BridgeAPI = {
    async persona_sign_web3(message) {
        return Services.Identity.signWithPersona(SignType.Message, String(message))
    },
    eth_request,
    async reload() {
        if (process.env.NODE_ENV === 'production') return
        Services.SiteAdaptor.attachMaskSDKToCurrentActivePage
    },
    ...SiteMethods,
}

// Those methods are safe. We can forward them directly without validate or permission control.
const forwardingMethods = [
    'eth_blockNumber',
    'eth_chainId',
    'eth_gasPrice',
    'eth_getBalance',
    'eth_getBalance',
    'eth_getBlockByNumber',
    'eth_getBlockTransactionCountByHash',
    'eth_getBlockTransactionCountByNumber',
    'eth_getCode',
    'eth_getFilterChanges',
    'eth_getFilterLogs',
    'eth_getLogs',
    'eth_getProof',
]
const dangerousMethod = []
const unknownIfIsSafe = ['eth_estimateGas', 'eth_feeHistory']
const don_tKnowIfNeedImplement = ['eth_call']
const unknownUsage = ['eth_coinbase']
const readonlyImpl: Record<EthereumMethodType, () => Promise<unknown>> = {} as any
for (const method of readonlyMethodType) {
    readonlyImpl[method] = async () => {}
}
const impl = {
    __proto__: null,

    eth_chainId() {
        return '0x1'
    },

    // Reference:
    // https://ethereum.github.io/execution-apis/api-documentation/
    // https://docs.metamask.io/wallet/reference/eth_subscribe/
}
async function eth_request(request: unknown) {
    if (typeof request !== 'object' || request === null) throw invalidRequest()

    const method = (request as any).method
    if (typeof method !== 'string' || !method) throw invalidMethod()
    if (!(method in impl)) throw unknownMethod(method)

    let params: unknown
    if (params && params !== undefined) {
        if (typeof params !== 'object' || !params) throw invalidParams()
    }

    return (impl as any)[method](params)
}
function invalidRequest() {
    throw new MaskEthereumProviderRpcError({
        code: -32600,
        data: null,
        message: 'Expected a single, non-array, object argument.',
    })
}

function invalidMethod() {
    throw new MaskEthereumProviderRpcError({
        code: -32600,
        data: null,
        message: "'args.method' must be a non-empty string.",
    })
}

function unknownMethod(name: string) {
    throw new MaskEthereumProviderRpcError({
        code: -32601,
        data: null,
        message: `The method "${name}" does not exist / is not available.`,
    })
}
function missingParams() {
    throw new MaskEthereumProviderRpcError({
        code: -32603,
        data: null,
        message: 'i.params is undefined',
    })
}
function invalidParams() {
    throw new MaskEthereumProviderRpcError({
        code: -32600,
        data: null,
        message: "'args.params' must be an object or array if provided.",
    })
}
