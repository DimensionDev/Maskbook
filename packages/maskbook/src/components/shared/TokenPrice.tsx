import { CurrencyType } from '@masknet/web3-shared'
import { useTokenPrice } from '../../plugins/Wallet/hooks/useTokenPrice'

interface TokenPriceProps {
    platform: string
    contractAddress: string | undefined
    amount: number
    currencyType?: CurrencyType
}

export const TokenPrice = ({ platform, contractAddress, amount, currencyType = CurrencyType.USD }: TokenPriceProps) => {
    const price = useTokenPrice(platform, contractAddress, currencyType) * amount
    return <span>${price.toFixed(2)}</span>
}
