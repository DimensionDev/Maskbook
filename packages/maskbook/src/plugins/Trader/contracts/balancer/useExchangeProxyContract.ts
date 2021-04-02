import type { AbiItem } from 'web3-utils'
import type { ExchangeProxy } from '@dimensiondev/contracts/types/ExchangeProxy'
import { useConstant } from '../../../../web3/hooks/useConstant'
import ExchangeProxyABI from '@dimensiondev/contracts/abis/ExchangeProxy.json'
import { TRADE_CONSTANTS } from '../../constants'
import { useContract } from '../../../../web3/hooks/useContract'

export function useExchangeProxyContract() {
    const address = useConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS')
    return useContract<ExchangeProxy>(address, ExchangeProxyABI as AbiItem[])
}
