import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'

const ENV = {
    production: 'https://api.transak.com/api/v2/currencies/price',
    development: 'https://staging-api.transak.com/api/v2/currencies/price',
    test: 'https://development-api.transak.com/api/v2/currencies/price',
}

const URL = ENV[process.env.NODE_ENV]

export function useTransakGetPriceFroETH(amount: string) {
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState<{ fiatAmount: string }>()
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const params = new URLSearchParams()
            params.append('fiatCurrency', 'USD')
            params.append('cryptoCurrency', 'ETH')
            params.append('isBuyOrSell', 'SELL')
            params.append('paymentMethod', 'credit_debit_card')
            params.append('cryptoAmount', amount)

            const response = await fetch(`${URL}?${params.toString()}`, { method: 'GET' })
            const json = await response.json()
            setLoading(false)
            setValue(json.response)
            return json
        }
        fetchData()
    }, [amount])

    return { loading, value }
}
