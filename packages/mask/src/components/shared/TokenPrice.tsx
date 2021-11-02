import type { FC, HTMLProps } from 'react'
import BigNumber from 'bignumber.js'
import { ChainId, CurrencyType } from '@masknet/web3-shared-evm'
import { useTokenPrice } from '../../plugins/Wallet/hooks/useTokenPrice'

interface TokenPriceProps extends Omit<HTMLProps<HTMLSpanElement>, 'children'> {
    chainId: ChainId
    contractAddress: string | undefined
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
    const price = useTokenPrice(chainId, contractAddress, currencyType)
    return <span {...rest}>${new BigNumber(amount).multipliedBy(price).toFixed(2)}</span>
}
