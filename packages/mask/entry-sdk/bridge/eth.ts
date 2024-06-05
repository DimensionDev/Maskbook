import { readonlyMethodType, EthereumMethodType, ProviderType, ChainId } from '@masknet/web3-shared-evm'
import Services from '#services'
import { MaskEthereumProviderRpcError, err } from '@masknet/sdk'
import { Err, Ok } from 'ts-results-es'
import { isSameAddress } from '@masknet/web3-shared-base'
import * as providers from /* webpackDefer: true */ '@masknet/web3-providers'
import { methodValidate, fromZodError, requestSchema, type Methods } from './eth/validator.js'
import { ZodError, ZodTuple } from 'zod'
import { maskSDK } from '../index.js'
import { sample } from 'lodash-es'
import { AsyncCall, JSONEncoder } from 'async-call-rpc/full'
import { isValidChecksumAddress } from '@ethereumjs/util'

const PassthroughMethods = [
    ...readonlyMethodType,
    EthereumMethodType.eth_getFilterChanges,
    EthereumMethodType.eth_getFilterLogs,
    EthereumMethodType.eth_newBlockFilter,
    EthereumMethodType.eth_newFilter,
    EthereumMethodType.eth_uninstallFilter,
] as const
type PassthroughMethods = (typeof PassthroughMethods)[number]
const passthroughMethods: Record<PassthroughMethods, (...params: any[]) => Promise<any>> = {} as any
for (const method of PassthroughMethods) {
    passthroughMethods[method] = async (...params: unknown[]) => {
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            readonly: true,
        }).request({ method, params })
    }
}

interface InteractiveClient {
    eth_subscribe?: Methods['eth_subscribe']
    eth_unsubscribe?: Methods['eth_unsubscribe']
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
        const signal = new AbortController()
        interactiveClient = AsyncCall<InteractiveClient>(
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
                forceSignal: signal.signal,
                encoder: JSONEncoder(),
                log: false,
                thenable: false,
            },
        )
        ws.addEventListener('close', () => {
            interactiveClient = undefined
            signal.abort()
        })
        ws.addEventListener('open', () => resolve(interactiveClient!))
        ws.addEventListener('error', () => {
            reject(err.internal_error())
            signal.abort()
        })
    })
}

// Reference:
// https://ethereum.github.io/execution-apis/api-documentation/
// https://docs.metamask.io/wallet/reference/eth_subscribe/
const methods: Methods = {
    ...passthroughMethods,

    async eth_accounts() {
        return Services.Wallet.sdk_eth_accounts(location.origin)
    },
    async eth_call(...params) {
        if (params[0].chainId) {
            const chainId = await Services.Wallet.sdk_eth_chainId()
            if (params[0].chainId !== '0x' + chainId.toString(16))
                return err.the_provider_is_disconnected_from_the_specified_chain()
        }
        return passthroughMethods.eth_call(params) as Promise<string>
    },
    async eth_chainId() {
        const chainId = await Services.Wallet.sdk_eth_chainId()
        return '0x' + chainId.toString(16)
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
    async eth_sendRawTransaction(transaction) {
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
        }).request({
            method: EthereumMethodType.eth_sendRawTransaction,
            params: [transaction],
        })
    },
    async eth_sendTransaction(options) {
        await Services.Wallet.requestUnlockWallet()
        const wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (!wallets.some((addr) => isSameAddress(addr, options.from)))
            return err.the_requested_account_and_or_method_has_not_been_authorized_by_the_user()
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            account: options.from,
        }).request({
            method: EthereumMethodType.eth_sendTransaction,
            params: [options],
        })
    },
    async eth_signTypedData_v4(requestedAddress, typedData) {
        await Services.Wallet.requestUnlockWallet()
        const wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (!wallets.some((addr) => isSameAddress(addr, requestedAddress)))
            return err.the_requested_account_and_or_method_has_not_been_authorized_by_the_user()
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            account: requestedAddress,
        }).request({
            method: EthereumMethodType.eth_signTypedData_v4,
            params: [requestedAddress, typedData],
        })
    },
    async eth_subscribe(...params) {
        if ((await Services.Wallet.sdk_eth_chainId()) !== ChainId.Mainnet) {
            return err.the_method_eth_subscribe_is_only_available_on_the_mainnet()
        }
        return (await getInteractiveClient()).eth_subscribe!(...params)
    },
    async eth_unsubscribe(...params) {
        return (await getInteractiveClient()).eth_unsubscribe!(...params)
    },
    wallet_addEthereumChain:
        process.env.NODE_ENV === 'development' ?
            async (request) => {
                // TODO: The wallet must reject the request if the chainId does not match the value of the eth_chainId method for any of the RPC urls.
                // TODO: The wallet MUST reject the request if the iconUrls field is provided, and any of the URLs are not valid URLs or do not point to a valid image.
                // TODO: The wallet MUST NOT allow the same chainId to be added multiple times.
                // TODO: make sure that: Only use the submitted chain ID to sign transactions, never a chain ID received from an RPC endpoint.
                // TODO: Verify that the specified chain ID matches the return value of eth_chainId from the endpoint, as described above.
                // TODO: Clearly inform the user which RPC URL is being used to communicate with a chain at any given moment, and inform the user of the risks of using multiple RPC endpoints to interact with the same chain.
                // TODO： The wallet should maintain a list of known chains, and verify requests to add chains against that list.
                return providers.EVMWeb3.getWeb3Provider({
                    providerType: ProviderType.MaskWallet,
                }).request({
                    method: EthereumMethodType.wallet_addEthereumChain,
                    params: [request],
                })
            }
            // Note: We have not figure out the security concern of this method, therefore hide it in the production.
        :   null!,
    async wallet_getPermissions() {
        return Services.Wallet.sdk_EIP2255_wallet_getPermissions(location.origin)
    },
    async wallet_requestPermissions(request) {
        if (Object.keys(request).length === 0)
            throw err.wallet_requestPermissions.a_permission_request_must_contain_at_least_1_permission()
        for (const key in request) {
            if (key !== 'eth_accounts' || typeof request[key] !== 'object' || request[key] === null)
                throw err.wallet_requestPermissions.permission_request_contains_unsupported_permission_permission({
                    permission: key,
                })
        }

        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
        }).request({
            method: EthereumMethodType.wallet_requestPermissions,
            params: [request],
        })
    },
    wallet_revokePermissions: null!,
    async wallet_switchEthereumChain(request) {
        const current = await Services.Wallet.sdk_eth_chainId()
        if (current === Number.parseInt(request.chainId, 16)) return null
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
        }).request({
            method: EthereumMethodType.wallet_switchEthereumChain,
            params: [request],
        })
    },
    async wallet_watchAsset({ type, options: { address, decimals, image, symbol, tokenId } }) {
        // TODO: throw error if chainId is unknown (https://eips.ethereum.org/EIPS/eip-747#erc1046-type)
        if (!isValidChecksumAddress(address)) return err.invalid_address()

        async function verifySymbol(contract: Promise<string>) {
            try {
                const realSymbol = await contract
                if (symbol && realSymbol !== symbol) {
                    throw err.wallet_watchAsset.the_symbol_in_the_request_request_does_not_match_the_symbol_in_the_contract_symbol(
                        { symbol: realSymbol, request: symbol },
                    )
                }
                symbol = realSymbol
            } catch {
                if (!symbol)
                    throw err.wallet_watchAsset.a_symbol_is_required_but_was_not_found_in_either_the_request_or_contract()
                // contract not implemented .symbol() but wallet_watchAsset provided one
            }
        }
        async function verifyContractInterface(supportsInterface: Promise<boolean>) {
            try {
                if (!(await supportsInterface)) throw new Error('Not ERC721')
            } catch {
                throw err.wallet_watchAsset.the_token_address_seems_invalid()
            }
        }
        if (type === 'ERC20') {
            const contract = providers.EVMContractReadonly.getERC20Contract(address)!.methods
            try {
                // try verify if it is a ERC20 contract
                await contract.totalSupply().call()
            } catch {
                return err.wallet_watchAsset.the_token_address_seems_invalid()
            }

            await Promise.all([
                verifySymbol(contract.symbol().call()),
                contract
                    .decimals()
                    .call()
                    .then(
                        (realDecimal) => {
                            const realDecimals = Number.parseInt(realDecimal, 10)
                            if (decimals && realDecimals !== decimals)
                                throw err.wallet_watchAsset.the_decimals_in_the_request_request_do_not_match_the_decimals_in_the_contract_decimals(
                                    { decimals: realDecimal + '', request: decimals + '' },
                                )
                            decimals = realDecimals
                        },
                        () => {
                            if (!decimals) {
                                throw err.wallet_watchAsset.decimals_are_required_but_were_not_found_in_either_the_request_or_contract()
                            }
                        },
                    ),
            ])
        } else if (type === 'ERC721') {
            const contract = providers.EVMContractReadonly.getERC721Contract(address)!.methods

            await verifyContractInterface(contract.supportsInterface('0x780e9d63').call())
            await verifySymbol(contract.symbol().call())

            const owner = await contract.ownerOf(tokenId).call()
            if (!isSameAddress(owner, (await Services.Wallet.sdk_eth_accounts(location.origin))[0] || '')) {
                return err.wallet_watchAsset.unable_to_verify_ownership_possibly_because_the_standard_is_not_supported_or_the_users_currently_selected_network_does_not_match_the_chain_of_the_asset_in_question()
            }
        } else if (type === 'ERC1155') {
            const contract = providers.EVMContractReadonly.getERC1155Contract(address)!.methods
            await verifyContractInterface(contract.supportsInterface('0xd9b67a26').call())

            const balance = await contract
                .balanceOf((await Services.Wallet.sdk_eth_accounts(location.origin))[0], tokenId)
                .call()
            if (balance === '0') {
                return err.wallet_watchAsset.unable_to_verify_ownership_possibly_because_the_standard_is_not_supported_or_the_users_currently_selected_network_does_not_match_the_chain_of_the_asset_in_question()
            }
        }
        providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
        })
            .request({
                method: EthereumMethodType.wallet_watchAsset,
                params: [{ type, options: { address, decimals, image, symbol, tokenId } }],
            })
            .catch(() => {})
        return true
    },
    async personal_sign(challenge, requestedAddress) {
        // check challenge is 0x hex
        await Services.Wallet.requestUnlockWallet()
        const wallets = await Services.Wallet.sdk_getGrantedWallets(location.origin)
        if (!wallets.some((addr) => isSameAddress(addr, requestedAddress)))
            return err.the_requested_account_and_or_method_has_not_been_authorized_by_the_user()
        return providers.EVMWeb3.getWeb3Provider({
            providerType: ProviderType.MaskWallet,
            account: requestedAddress,
        }).request({
            method: EthereumMethodType.personal_sign,
            params: [challenge, requestedAddress],
        })
    },
    async personal_ecRecover(message, signature) {
        return providers.EVMWeb3.getWeb3().eth.accounts.recover(message, signature)
    },
}

export async function eth_request(request: unknown): Promise<{ e?: MaskEthereumProviderRpcError | null; d?: unknown }> {
    try {
        // validate request
        const requestValidate = requestSchema.safeParse(request)
        if (!requestValidate.success) return { e: fromZodError(requestValidate.error) }

        // validate method
        const { method: _method, params } = requestValidate.data
        if (!(methods as any)[_method]) {
            return {
                e: err.the_method_method_does_not_exist_is_not_available({ method: _method }),
            }
        }

        // assert argument & return value validator exists
        if (!(_method in methodValidate)) {
            console.error(`[Mask wallet] Missing schema for method ${_method}`)
            return { e: err.internal_error() }
        }
        const method = _method as keyof Methods

        let paramsArr: unknown[]
        if (!params) paramsArr = []
        else if (!Array.isArray(params)) paramsArr = [params]
        else paramsArr = params

        // validate parameters
        const paramsSchema = methodValidate[method].args
        if (paramsSchema instanceof ZodTuple && paramsSchema.items.length !== paramsArr.length) {
            paramsArr.length = paramsSchema.items.length
        }
        const paramsValidated = paramsSchema.safeParse(paramsArr)
        if (!paramsValidated.success) {
            if (process.env.NODE_ENV === 'development') {
                console.debug(
                    '[Mask Wallet] The request failed to pass the validation',
                    request,
                    'received params',
                    paramsArr,
                )
            }
            return { e: fromZodError(paramsValidated.error) }
        }

        if (process.env.NODE_ENV === 'development') {
            console.debug('[Mask Wallet] Received raw request', request, 'after validation', paramsValidated.data)
        }
        // call the method
        const fn: (...args: any[]) => any = Reflect.get(methods, method)!
        let result
        try {
            result = await fn(...paramsValidated.data)
            if (result instanceof Err) throw result.error
            if (result instanceof Ok) result = result.value
            if (result instanceof MaskEthereumProviderRpcError) throw result
        } catch (error: any) {
            if (error instanceof MaskEthereumProviderRpcError) return { e: error }
            if (error.message === 'User rejected the message.') return { e: err.user_rejected_the_request() }

            console.error('[Mask wallet] Internal error when handling request', requestValidate.data, error)
            return { e: err.internal_error() }
        }

        // validate return value
        const returnSchema = methodValidate[method].return
        const resultValidate = returnSchema.safeParse(result)
        if (!resultValidate.success) {
            console.debug('[Mask wallet] Return value invalid', result)
            throw fromZodError(resultValidate.error)
        }
        if (process.env.NODE_ENV === 'development') {
            console.debug('[Mask wallet] Request success', requestValidate.data, resultValidate.data)
        }
        return { d: resultValidate.data }
    } catch (error) {
        if (error instanceof ZodError) console.error(...error.issues)
        else console.error(error)

        return { e: err.internal_error() }
    }
}
