import { readonlyMethodType, EthereumMethodType, ProviderType, ChainId } from '@masknet/web3-shared-evm'
import Services from '#services'
import { type EIP2255PermissionRequest, MaskEthereumProviderRpcError, err } from '@masknet/sdk'
import { Err, Ok } from 'ts-results-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import * as providers from /* webpackDefer: true */ '@masknet/web3-providers'
import { ParamsValidate, fromZodError, requestSchema, ReturnValidate } from './eth/validator.js'
import { ZodError, ZodTuple } from 'zod'
import { maskSDK } from '../index.js'
import { sample } from 'lodash-es'
import { AsyncCall, JSONSerialization } from 'async-call-rpc/full'

const PassthroughMethods = [
    ...readonlyMethodType,
    EthereumMethodType.ETH_GET_FILTER_CHANGES,
    EthereumMethodType.ETH_GET_FILTER_LOGS,
    EthereumMethodType.ETH_NEW_BLOCK_FILTER,
    EthereumMethodType.ETH_NEW_FILTER,
    EthereumMethodType.ETH_UNINSTALL_FILTER,
]
type PassthroughMethods = (typeof PassthroughMethods)[number]
const passthroughMethods: Record<PassthroughMethods, (params: unknown[] | undefined) => Promise<unknown>> = {} as any
for (const method of PassthroughMethods) {
    passthroughMethods[method] = async (...params: unknown[]) => {
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            readonly: true,
        }).request({ method, params })
    }
}

interface InteractiveClient {
    eth_subscribe(...params: Zod.infer<(typeof ParamsValidate)['eth_subscribe']>): Promise<string>
    eth_unsubscribe(...params: Zod.infer<(typeof ParamsValidate)['eth_unsubscribe']>): Promise<string>
}

let interactiveClient: InteractiveClient | undefined
// TODO: Our infrastructure uses HTTP endpoints (packages/web3-providers/src/helpers/createWeb3ProviderFromURL.ts).
//       Only WebSocket infura endpoints can subscribe to events (required for eth_subscribe).
//       As a workaround, we establish the WebSocket connection at the content script.
//       This is a problem for unknown web pages (CSP limitations), but acceptable for Mask SDK users.
//       They need to unblock mainnet.infura.io in their CSP.
//       For initial implementation simplicity and cost consideration (subscription is only free on mainnet for infura),
//       we only support subscribe on the mainnet.
function getInteractiveClient(): Promise<InteractiveClient> {
    if (interactiveClient) return Promise.resolve(interactiveClient)
    return new Promise<InteractiveClient>((resolve, reject) => {
        // The following endpoints are from packages/web3-constants/evm/rpc.json
        const ws = new WebSocket(
            sample([
                'wss://mainnet.infura.io/ws/v3/d74bd8586b9e44449cef131d39ceeefb',
                'wss://mainnet.infura.io/ws/v3/d65858b010d249419cf8687eca12b094',
                'wss://mainnet.infura.io/ws/v3/a9d66980bf334e59a42ca19095f3daeb',
                'wss://mainnet.infura.io/ws/v3/f39cc8734e294fba9c3938486df2b1bc',
                'wss://mainnet.infura.io/ws/v3/659123dd11294baf8a294d7a11cec92c',
            ])!,
        )
        interactiveClient = AsyncCall(
            {
                eth_subscription(data: unknown) {
                    maskSDK.eth_message({ type: 'eth_subscription', data })
                },
            },
            {
                channel: {
                    send: (message) => ws.send(message as string),
                    on: (fn) => ws.addEventListener('message', (event) => fn(event.data)),
                },
                serializer: JSONSerialization(),
                log: false,
                thenable: false,
            },
        )
        ws.addEventListener('close', () => (interactiveClient = undefined))
        ws.addEventListener('open', () => resolve(interactiveClient!))
        ws.addEventListener('error', () => reject(err.internal_error()))
    })
}

// Reference:
// https://ethereum.github.io/execution-apis/api-documentation/
// https://docs.metamask.io/wallet/reference/eth_subscribe/
const methods = {
    ...passthroughMethods,

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
        if ((await Services.Wallet.sdk_eth_chainId()) !== ChainId.Mainnet) {
            return err.the_method_eth_subscribe_is_only_available_on_the_mainnet()
        }
        return (await getInteractiveClient()).eth_subscribe(...params)
    },
    async eth_unsubscribe(...params: Zod.infer<(typeof ParamsValidate)['eth_sendRawTransaction']>) {
        return (await getInteractiveClient()).eth_unsubscribe(...params)
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
            if (error instanceof MaskEthereumProviderRpcError) return { e: error }
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
