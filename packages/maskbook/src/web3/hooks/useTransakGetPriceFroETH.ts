import { useAsync } from 'react-use'

const ENV = {
    production: 'https://api.transak.com/api/v2/currencies/price',
    development: 'https://staging-api.transak.com/api/v2/currencies/price',
    test: 'https://development-api.transak.com/api/v2/currencies/price',
}

const URL = ENV[process.env.NODE_ENV]

export function useTransakGetPriceFroETH(amount: string) {
    return useAsync(async () => {
        const params = new URLSearchParams()
        params.append('fiatCurrency', 'USD')
        params.append('cryptoCurrency', 'ETH')
        params.append('isBuyOrSell', 'SELL')
        params.append('paymentMethod', 'credit_debit_card')
        params.append('cryptoAmount', amount)

        const response = await fetch(`${URL}?${params.toString()}`, { method: 'GET' })
            .then((res) => res.json())
            .then((res) => res.response)
        return response
    })
}
