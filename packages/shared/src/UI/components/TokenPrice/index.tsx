import type { HTMLProps } from 'react'
import type { BigNumber } from 'bignumber.js'
import { type ChainId, isZeroAddress } from '@masknet/web3-shared-evm'
import { CurrencyType, multipliedBy } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useFungibleTokenPrice, useNativeTokenPrice } from '@masknet/web3-hooks-base'

interface TokenPriceProps extends Omit<HTMLProps<HTMLSpanElement>, 'children'> {
    chainId: ChainId
    contractAddress?: string
    amount: BigNumber.Value
    currencyType?: CurrencyType
}

export function TokenPrice({
    chainId,
    contractAddress,
    amount,
    currencyType = CurrencyType.USD,
    ...rest
}: TokenPriceProps) {
    const { data: tokenPrice = 0 } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, contractAddress?.toLowerCase(), {
        chainId,
        currencyType,
    })
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const price = isZeroAddress(contractAddress) ? nativeTokenPrice : tokenPrice
    return <span {...rest}>${multipliedBy(amount, price).toFixed(2)}</span>
}
