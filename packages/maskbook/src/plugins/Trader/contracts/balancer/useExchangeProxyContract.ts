import ExchangeProxyABI from '@masknet/contracts/abis/ExchangeProxy.json'
import type { ExchangeProxy } from '@masknet/contracts/types/ExchangeProxy'
import { useContract, useTraderConstants } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useExchangeProxyContract() {
    const { BALANCER_EXCHANGE_PROXY_ADDRESS } = useTraderConstants()
    return useContract<ExchangeProxy>(BALANCER_EXCHANGE_PROXY_ADDRESS, ExchangeProxyABI as AbiItem[])
}
