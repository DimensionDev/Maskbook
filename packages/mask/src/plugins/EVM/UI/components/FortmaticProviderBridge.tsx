import { useEffect } from 'react'
import Fortmatic from 'fortmatic'
import { first } from 'lodash-unified'
import type { FmProvider } from 'fortmatic/dist/cjs/src/core/fm-provider'
import { ChainId, createLookupTableResolver, EthereumMethodType, getRPCConstants } from '@masknet/web3-shared-evm'
import { EVM_Messages } from '../../messages'

//#region create in-page fortmatic provider

/* spell-checker: disable-next-line */
const TEST_KEY = 'pk_test_D9EAF9A8ACEC9627'

/* spell-checker: disable-next-line */
const LIVE_KEY = 'pk_live_331BE8AA24445030'

type FORTMATIC_CHAIN_ID =
    | ChainId.Mainnet
    | ChainId.BSC
    | ChainId.Matic
    | ChainId.Rinkeby
    | ChainId.Ropsten
    | ChainId.Kovan

export const API_KEY_CHAIN_MAPPINGS = createLookupTableResolver<FORTMATIC_CHAIN_ID, string>(
    {
        [ChainId.Mainnet]: LIVE_KEY,
        [ChainId.BSC]: LIVE_KEY,
        [ChainId.Matic]: LIVE_KEY,
        [ChainId.Rinkeby]: TEST_KEY,
        [ChainId.Ropsten]: TEST_KEY,
        [ChainId.Kovan]: TEST_KEY,
    },
    LIVE_KEY,
)

const providerPool = new Map<ChainId, FmProvider>()

export function createProvider(chainId: FORTMATIC_CHAIN_ID) {
    if (providerPool.has(chainId)) return providerPool.get(chainId)!

    // invalid rpc URL
    const rpcUrl = first(getRPCConstants(chainId).RPC)
    if (!rpcUrl) throw new Error('Failed to create provider.')

    // create fm provider
    const fm = new Fortmatic(API_KEY_CHAIN_MAPPINGS(chainId), { chainId, rpcUrl })
    const provider = fm.getProvider()
    providerPool.set(chainId, provider)
    return provider
}
//#endregion

export interface FortmaticProviderBridgeProps {}

export function FortmaticProviderBridge(props: FortmaticProviderBridgeProps) {
    useEffect(() => {
        return EVM_Messages.events.FORTMATIC_PROVIDER_RPC_REQUEST.on(async ({ payload }) => {
            try {
                const provider = createProvider(ChainId.Mainnet)
                const result =
                    payload.method === EthereumMethodType.ETH_REQUEST_ACCOUNTS
                        ? await provider.enable()
                        : await provider.send(payload.method, payload.params)
                EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    result,
                    error: null,
                })
            } catch (error: unknown) {
                EVM_Messages.events.FORTMATIC_PROVIDER_RPC_RESPONSE.sendToBackgroundPage({
                    payload,
                    error: error instanceof Error ? error : new Error(),
                })
            }
        })
    }, [])

    return null
}
