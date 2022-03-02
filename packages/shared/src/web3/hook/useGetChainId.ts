import { EthereumMethodType, RequestOptions, SendOverrides, useWeb3Provider } from '@masknet/web3-shared-evm'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'
import useAsyncFn from 'react-use/lib/useAsyncFn'

export function useGetChainId(
    overrides?: SendOverrides,
    options?: RequestOptions,
): AsyncFnReturn<() => Promise<string>> {
    const web3Provider = useWeb3Provider(overrides, options)
    return useAsyncFn(
        async () =>
            web3Provider.request({
                method: EthereumMethodType.ETH_CHAIN_ID,
            }) as Promise<string>,
        [web3Provider],
    )
}
