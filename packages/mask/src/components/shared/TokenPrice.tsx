import type { FC, HTMLProps } from 'react'
import BigNumber from 'bignumber.js'
import { ChainId, CurrencyType, isSameAddress } from '@masknet/web3-shared-evm'
import { useNativeTokenPrice, useTokenPrice } from '../../plugins/Wallet/hooks/useTokenPrice'
import { ZERO_ADDRESS } from '../../plugins/GoodGhosting/constants'

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
    return <span {...rest}>${new BigNumber(amount).multipliedBy(price).toFixed(2)}</span>
}
