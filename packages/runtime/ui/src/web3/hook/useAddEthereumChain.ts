import {
    EthereumChainDetailed,
    EthereumMethodType,
    RequestOptions,
    SendOverrides,
    useWeb3Provider,
} from '@masknet/web3-shared-evm'
import Web3 from 'web3'
import { useAsyncFn } from 'react-use'

export function useSwitchEthereumChain(
    chainDetailed: EthereumChainDetailed,
    address: string,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    const web3Provider = useWeb3Provider(overrides, options)
    return useAsyncFn(async () => {
        web3Provider.request({
            method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
            params: [chainDetailed, address].filter(Boolean),
        })
        const web3 = new Web3(web3Provider)
        return web3.eth.addEthereumChain(chainDetailed, address, overrides)
    }, [web3Provider, chainDetailed, address, overrides])
}
