import type { FC, HTMLProps } from 'react'
import type BigNumber from 'bignumber.js'
import { ChainId, isZeroAddress } from '@masknet/web3-shared-evm'
import { CurrencyType, multipliedBy, NetworkPluginID } from '@masknet/web3-shared-base'
import { useFungibleTokenPrice, useNativeTokenPrice } from '@masknet/plugin-infra/web3'

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
    const { value: tokenPrice = 0 } = useFungibleTokenPrice(
        NetworkPluginID.PLUGIN_EVM,
        contractAddress?.toLowerCase(),
        {
            chainId,
            currencyType,
        },
    )
    const { value: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const price = isZeroAddress(contractAddress) ? nativeTokenPrice : tokenPrice
    return <span {...rest}>${multipliedBy(amount, price).toFixed(2)}</span>
}
