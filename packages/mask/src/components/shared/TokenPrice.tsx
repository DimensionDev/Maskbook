import type { FC, HTMLProps } from 'react'
import type BigNumber from 'bignumber.js'
import { ChainId, isZeroAddress } from '@masknet/web3-shared-evm'
import { multipliedBy } from '@masknet/web3-shared-base'
import type { CurrencyType } from '@masknet/plugin-infra'
import { useNativeTokenPrice, useTokenPrice } from '../../plugins/Wallet/hooks/useTokenPrice'

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
    const price = isZeroAddress(contractAddress) ? nativeTokenPrice : tokenPrice
    return <span {...rest}>${multipliedBy(amount, price).toFixed(2)}</span>
}
