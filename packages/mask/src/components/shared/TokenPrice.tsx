import type { FC, HTMLProps } from 'react'
import type BigNumber from 'bignumber.js'
import { ChainId, CurrencyType, isSameAddress, ZERO_ADDRESS } from '@masknet/web3-shared-evm'
import { useNativeTokenPrice, useTokenPrice } from '../../plugins/Wallet/hooks/useTokenPrice'
import { multipliedBy } from '@masknet/web3-shared-base'

interface TokenPriceProps extends Omit<HTMLProps<HTMLSpanElement>, 'children'> {
    chainId: ChainId
    contractAddress?: string
    amount: BigNumber.Value
    currencyType?: CurrencyType
}

export const TokenPrice: FC<TokenPriceProps> = ({
    chainId,
    contractAddress,
    amount,
    currencyType = CurrencyType.USD,
    ...rest
}) => {
    const tokenPrice = useTokenPrice(chainId, contractAddress?.toLowerCase(), currencyType)
    const nativeTokenPrice = useNativeTokenPrice(chainId)
    const price = isSameAddress(contractAddress, ZERO_ADDRESS) ? nativeTokenPrice : tokenPrice
    return <span {...rest}>${multipliedBy(amount, price).toFixed(2)}</span>
}
