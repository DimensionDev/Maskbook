import type { AbiItem } from 'web3-utils'
import type { ExchangeProxy } from '@masknet/contracts/types/ExchangeProxy'
import ExchangeProxyABI from '@masknet/contracts/abis/ExchangeProxy.json'
import { TRADE_CONSTANTS } from '../../constants'
import { useConstant, useContract } from '@masknet/web3-shared'

export function useExchangeProxyContract() {
    const address = useConstant(TRADE_CONSTANTS).BALANCER_EXCHANGE_PROXY_ADDRESS
    return useContract<ExchangeProxy>(address, ExchangeProxyABI as AbiItem[])
}
