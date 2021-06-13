import { useAsync } from 'react-use'
import type { Coin } from '../../Trader/types/trending'

const ENV = {
    production: 'https://api.transak.com/api/v2/currencies/crypto-currencies',
    development: 'https://staging-api.transak.com/api/v2/currencies/crypto-currencies',
    test: 'https://development-api.transak.com/api/v2/currencies/crypto-currencies',
}

const URL = ENV[process.env.NODE_ENV]

export function useTransakAllowanceCoin(coin: Coin): boolean {
    return useAsync(async () => {
        if (coin.contract_address || coin.symbol.toLowerCase() === 'eth') {
            const allowanceList = await fetch(URL, { method: 'GET' })
                .then((res) => res.json())
                .then((res) => res.response)
            return allowanceList.map((val: Coin) => val.symbol).includes(coin.symbol)
        }
        return false
    }).value
}
