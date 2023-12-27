import { readonlyMethodType, EthereumMethodType, ProviderType, type Web3Provider } from '@masknet/web3-shared-evm'
import Services from '#services'
import { type EIP2255PermissionRequest, MaskEthereumProviderRpcError, err } from '@masknet/sdk'
import { Err, Ok } from 'ts-results-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import * as providers from /* webpackDefer: true */ '@masknet/web3-providers'
import { ParamsValidate, fromZodError, requestSchema, ReturnValidate } from './eth/validator.js'
import { ZodError, ZodTuple } from 'zod'
import { maskSDK } from '../index.js'

const readonlyMethods: Record<EthereumMethodType, (params: unknown[] | undefined) => Promise<unknown>> = {} as any
for (const method of readonlyMethodType) {
    readonlyMethods[method] = async (...params: unknown[]) => {
        return (await Services.Wallet.send({ jsonrpc: '2.0', method, params })).result
    }
}

let readonlyClient: Web3Provider
function setReadonlyClient(): Web3Provider {
    return (readonlyClient ??= providers.EVMWeb3.getWeb3Provider({
        providerType: ProviderType.MaskWallet,
        silent: true,
        readonly: true,
    }))
}
const subscriptionMap = new Map<string, () => void>()
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
        return err.user_rejected_the_request()
    },
    async personal_sign(...[challenge, requestedAddress]: Zod.infer<(typeof ParamsValidate)['personal_sign']>) {
        // check challenge is 0x hex
        await Services.Wallet.requestUnlockWallet()
        const wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (!wallets.some((addr) => isSameAddress(addr, requestedAddress)))
            return err.the_requested_account_and_or_method_has_not_been_authorized_by_the_user()
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            account: requestedAddress,
            silent: false,
            readonly: false,
        }).request({
            method: EthereumMethodType.PERSONAL_SIGN,
            params: [challenge, requestedAddress],
        })
    },
    async eth_sendTransaction(...[options]: Zod.infer<(typeof ParamsValidate)['eth_sendTransaction']>) {
        const wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (!wallets.some((addr) => isSameAddress(addr, options.from)))
            return err.the_requested_account_and_or_method_has_not_been_authorized_by_the_user()
        const p = providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            account: options.from,
            silent: false,
            readonly: false,
            // this is strange. why I cannot pass options via request.params?
            overrides: options as any,
        })
        return p.request({
            method: EthereumMethodType.ETH_SEND_TRANSACTION,
            // this options here actually get ignored!
            params: options as any,
        })
    },
    async eth_sendRawTransaction(...[transaction]: Zod.infer<(typeof ParamsValidate)['eth_sendRawTransaction']>) {
        const p = providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            silent: false,
            readonly: false,
        })
        return p.request({
            method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
            params: [transaction] as any,
        })
    },
    async eth_subscribe(...params: Zod.infer<(typeof ParamsValidate)['eth_subscribe']>) {
        const id = String(
            await setReadonlyClient().request({
                method: EthereumMethodType.ETH_SUBSCRIBE,
                params,
            }),
        )
        const fn = (message: { type: string; data: unknown }): void => {
            if (message.type === EthereumMethodType.ETH_SUBSCRIBE && (message.data as any).subscription === id) {
                maskSDK.eth_message(message)
            }
        }
        subscriptionMap.set(id, () => readonlyClient.removeListener('message', fn))
        readonlyClient.on('message', fn)
        window.addEventListener('beforeunload', () =>
            readonlyClient!.request({ method: EthereumMethodType.ETH_UNSUBSCRIBE, params: [id] }),
        )
        return id
    },
    async eth_unsubscribe(...params: Zod.infer<(typeof ParamsValidate)['eth_sendRawTransaction']>) {
        await setReadonlyClient().request({
            method: EthereumMethodType.ETH_UNSUBSCRIBE,
            params,
        })
        subscriptionMap.get(params[0])?.()
        return null
    },
    // https://eips.ethereum.org/EIPS/eip-2255
    wallet_getPermissions() {
        return Services.Wallet.sdk_EIP2255_wallet_getPermissions(location.origin)
    },
    async wallet_requestPermissions(request: EIP2255PermissionRequest) {
        if (Object.keys(request).length === 0)
            throw err.wallet_requestPermissions.a_permission_request_must_contain_at_least_1_permission()
        for (const key in request) {
            if (typeof key !== 'string' || typeof request[key] !== 'object' || request[key] === null)
                throw err.wallet_requestPermissions.permission_request_contains_unsupported_permission_permission({
                    permission: key,
                })
        }
        return Services.Wallet.sdk_EIP2255_wallet_requestPermissions(location.origin, request)
    },
}
Object.setPrototypeOf(methods, null)

export async function eth_request(request: unknown): Promise<{ e?: MaskEthereumProviderRpcError | null; d?: unknown }> {
    try {
        // validate request
        const requestValidate = requestSchema.safeParse(request)
        if (!requestValidate.success) return { e: fromZodError(requestValidate.error) }

        // validate method
        const { method, params } = requestValidate.data
        if (!(method in methods)) {
            return {
                e: err.the_method_method_does_not_exist_is_not_available({ method }),
            }
        }

        // assert argument & return value validator exists
        if (!(method in ParamsValidate)) {
            console.error(`Missing parameter schema for method ${method}`)
            return { e: err.internal_error() }
        }
        if (!(method in ReturnValidate)) {
            console.error(`Missing return schema for method ${method}`)
            return { e: err.internal_error() }
        }

        let paramsArr: unknown[]
        if (!params) paramsArr = []
        else if (!Array.isArray(params)) paramsArr = [params]
        else paramsArr = params

        // validate parameters
        // @ts-expect-error keyof
        const paramsSchema: Zod.ZodAny = ParamsValidate[method]
        if (paramsSchema instanceof ZodTuple && paramsSchema.items.length !== paramsArr.length) {
            paramsArr.length = paramsSchema.items.length
        }
        const paramsValidated = paramsSchema.safeParse(paramsArr)
        if (!paramsValidated.success) return { e: fromZodError(paramsValidated.error) }

        // call the method
        const fn = Reflect.get(methods, method)
        let result
        try {
            result = await fn(...paramsValidated.data)
            if (result instanceof Err) throw result.error
            if (result instanceof Ok) result = result.value
        } catch (error: any) {
            if (error instanceof MaskEthereumProviderRpcError) return { e: result.error }
            if (error.message === 'User rejected the message.') return { e: err.user_rejected_the_request() }

            console.error(error)
            throw new Error('internal error')
        }

        // validate return value
        // @ts-expect-error keyof
        const returnSchema: Zod.ZodAny = ReturnValidate[method]
        return { d: returnSchema.parse(result) }
    } catch (error) {
        if (error instanceof ZodError) console.error(...error.issues)
        else console.error(error)

        return { e: err.internal_error() }
    }
}
