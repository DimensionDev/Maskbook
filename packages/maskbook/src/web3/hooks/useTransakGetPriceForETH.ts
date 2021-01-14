import BigNumber from 'bignumber.js'
import { useEffect, useState } from 'react'

const ENV = {
    production: 'https://api.transak.com/api/v2/currencies/price',
    development: 'https://staging-api.transak.com/api/v2/currencies/price',
    test: 'https://development-api.transak.com/api/v2/currencies/price',
}

const URL = ENV[process.env.NODE_ENV]

export function useTransakGetPriceForETH(amount: string) {
    const [loading, setLoading] = useState(true)
    const [value, setValue] = useState('0')
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const params = new URLSearchParams()
            params.append('fiatCurrency', 'USD')
            params.append('cryptoCurrency', 'ETH')
            params.append('isBuyOrSell', 'SELL')
            params.append('paymentMethod', 'credit_debit_card')
            params.append('cryptoAmount', '1')

            const response = await fetch(`${URL}?${params.toString()}`, { method: 'GET' })
            const json = await response.json()
            setLoading(false)

            const _amount = new BigNumber(json.response.fiatAmount).multipliedBy(amount)
            setValue(_amount.toFixed(6))
        }
        fetchData()
    }, [amount])

    return { loading, value }
}
