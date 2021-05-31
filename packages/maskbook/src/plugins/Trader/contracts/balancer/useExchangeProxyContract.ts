import type { AbiItem } from 'web3-utils'
import type { ExchangeProxy } from '@dimensiondev/contracts/types/ExchangeProxy'
import ExchangeProxyABI from '@dimensiondev/contracts/abis/ExchangeProxy.json'
import { TRADE_CONSTANTS } from '../../constants'
import { useConstant, useContract } from '@dimensiondev/web3-shared'

export function useExchangeProxyContract() {
    const address = useConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS')
    return useContract<ExchangeProxy>(address, ExchangeProxyABI as AbiItem[])
}
