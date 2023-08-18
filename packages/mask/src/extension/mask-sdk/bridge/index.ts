import { MaskEthereumProviderRpcError, type BridgeAPI } from '@masknet/sdk'
import { SignType } from '@masknet/shared-base'
import Services from '../../service.js'
import { SiteMethods } from './site_context.js'
import { readonlyMethodType, type EthereumMethodType } from '@masknet/web3-shared-evm'

export const maskSDKServer: BridgeAPI = {
    async persona_signMessage(message) {
        return Services.Identity.signWithPersona(SignType.Message, String(message))
    },
    eth_request,
    async reload() {
        if (process.env.NODE_ENV === 'production') return
        Services.SiteAdaptor.attachMaskSDKToCurrentActivePage
    },
    ...SiteMethods,
}

const readonlyImpl: Record<EthereumMethodType, (params: unknown[] | undefined) => Promise<unknown>> = {} as any
for (const method of readonlyMethodType) {
    readonlyImpl[method] = async (params: unknown[] | undefined) => {
        return Services.Wallet.send({ jsonrpc: '2.0', method, params })
    }
}
const impl = {
    ...readonlyImpl,
    // Reference:
    // https://ethereum.github.io/execution-apis/api-documentation/
    // https://docs.metamask.io/wallet/reference/eth_subscribe/
}
Object.setPrototypeOf(impl, null)

async function eth_request(request: unknown) {
    if (typeof request !== 'object' || request === null) throw invalidRequest()

    const { method } = request as any
    if (typeof method !== 'string' || !method) throw invalidMethod()
    if (!(method in impl)) throw unknownMethod(method)

    const { params } = request as any
    if (params !== undefined && !Array.isArray(params)) throw invalidParams()

    return impl[method as keyof typeof impl](params)
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
