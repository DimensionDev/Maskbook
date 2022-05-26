import {
    EthereumChainDetailed,
    EthereumMethodType,
    RequestOptions,
    SendOverrides,
    useWeb3Provider,
} from '@masknet/web3-shared-evm'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'
import useAsyncFn from 'react-use/lib/useAsyncFn'

export function useAddEthereumChain(
    overrides?: SendOverrides,
    options?: RequestOptions,
): AsyncFnReturn<(chainDetailed: EthereumChainDetailed, address: string) => Promise<unknown>> {
    const web3Provider = useWeb3Provider(overrides, options)
    return useAsyncFn(
        async (chainDetailed: EthereumChainDetailed, address: string) =>
            web3Provider.request({
                method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
                params: [chainDetailed, address].filter(Boolean),
            }),
        [web3Provider],
    )
}
