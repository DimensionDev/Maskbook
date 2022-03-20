import type { AbiItem } from 'web3-utils'
import ExchangeProxyABI from '@masknet/web3-contracts/abis/ExchangeProxy.json'
import type { ExchangeProxy } from '@masknet/web3-contracts/types/ExchangeProxy'
import { ChainId, useContract, useTraderConstants } from '@masknet/web3-shared-evm'

export function useExchangeProxyContract(chainId?: ChainId) {
    const { BALANCER_EXCHANGE_PROXY_ADDRESS } = useTraderConstants(chainId)
    return useContract<ExchangeProxy>(BALANCER_EXCHANGE_PROXY_ADDRESS, ExchangeProxyABI as AbiItem[], chainId)
}
