import { ChainId, EthereumMethodType, RequestOptions, SendOverrides, useWeb3Provider } from '@masknet/web3-shared-evm'
import Web3 from 'web3'
import { toHex } from 'web3-utils'
import { useAsyncFn } from 'react-use'

export function useSwitchEthereumChain(chainId: ChainId, overrides?: SendOverrides, options?: RequestOptions) {
    const web3Provider = useWeb3Provider(overrides, options)

    return useAsyncFn(async () => {
        web3Provider.request({
            method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
            params: [
                {
                    chainId: toHex(chainId),
                },
            ],
        })

        const web3 = new Web3(web3Provider)
        return web3.eth.switchEthereumChain(chainId, overrides)
    }, [web3Provider, chainId, overrides])
}
