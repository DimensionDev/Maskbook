import { ChainId, CurrencyType } from '@masknet/web3-shared'
import { useTokenPrice } from '../../plugins/Wallet/hooks/useTokenPrice'

interface TokenPriceProps {
    chainId: ChainId
    contractAddress: string | undefined
    amount: number
    currencyType?: CurrencyType
}

export const TokenPrice = ({ chainId, contractAddress, amount, currencyType = CurrencyType.USD }: TokenPriceProps) => {
    const price = useTokenPrice(chainId, contractAddress, currencyType) * amount
    return <span>${price.toFixed(2)}</span>
}
