import type { AbiItem } from 'web3-utils'
import type { ExchangeProxy } from '../../../../contracts/ExchangeProxy'
import { useConstant } from '../../../../web3/hooks/useConstant'
import ExchangeProxyABI from '../../../../../abis/ExchangeProxy.json'
import { TRADE_CONSTANTS } from '../../constants'
import { useContract } from '../../../../web3/hooks/useContract'

export function useExchangeProxyContract() {
    const address = useConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS')
    return useContract<ExchangeProxy>(address, ExchangeProxyABI as AbiItem[])
}
