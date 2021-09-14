import type { FC, HTMLProps } from 'react'
import { ChainId, CurrencyType } from '@masknet/web3-shared'
import { useTokenPrice } from '../../plugins/Wallet/hooks/useTokenPrice'

interface TokenPriceProps extends Omit<HTMLProps<HTMLSpanElement>, 'children'> {
    chainId: ChainId
    contractAddress: string | undefined
    amount: number
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
    return <span {...rest}>${(price * amount).toFixed(2)}</span>
}
