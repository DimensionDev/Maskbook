import { ChainId, EthereumMethodType, RequestOptions, SendOverrides, useWeb3Provider } from '@masknet/web3-shared-evm'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'
import useAsyncFn from 'react-use/lib/useAsyncFn'
import { toHex } from 'web3-utils'

export function useSwitchEthereumChain(
    overrides?: SendOverrides,
    options?: RequestOptions,
): AsyncFnReturn<(chainId: ChainId) => Promise<unknown>> {
    const web3Provider = useWeb3Provider(overrides, options)
    return useAsyncFn(
        async (chainId: ChainId) =>
            web3Provider.request({
                method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [
                    {
                        chainId: toHex(chainId),
                    },
                ],
            }),
        [web3Provider],
    )
}
