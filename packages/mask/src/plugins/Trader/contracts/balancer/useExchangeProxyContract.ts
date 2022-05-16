import type { AbiItem } from 'web3-utils'
import ExchangeProxyABI from '@masknet/web3-contracts/abis/ExchangeProxy.json'
import type { ExchangeProxy } from '@masknet/web3-contracts/types/ExchangeProxy'
import { ChainId, useTraderConstants } from '@masknet/web3-shared-evm'
import { useContract } from '@masknet/plugin-infra/web3-evm'

export function useExchangeProxyContract(chainId?: ChainId) {
    const { BALANCER_EXCHANGE_PROXY_ADDRESS } = useTraderConstants(chainId)
    return useContract<ExchangeProxy>(chainId, BALANCER_EXCHANGE_PROXY_ADDRESS, ExchangeProxyABI as AbiItem[])
}
