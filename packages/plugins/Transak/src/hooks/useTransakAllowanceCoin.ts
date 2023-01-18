import { useAsync } from 'react-use'

const ENV = {
    production: 'https://api.transak.com/api/v2/currencies/crypto-currencies',
    development: 'https://staging-api.transak.com/api/v2/currencies/crypto-currencies',
    test: 'https://development-api.transak.com/api/v2/currencies/crypto-currencies',
}

const URL = ENV[process.env.NODE_ENV]

export function useTransakAllowanceCoin(token: { address?: string; symbol: string }): boolean {
    return useAsync(async () => {
        if (token.symbol) {
            const allowanceList = await fetch(URL, { method: 'GET' })
                .then((res) => res.json())
                .then((res) => res.response)
            return allowanceList.map((val: { symbol: string }) => val.symbol).includes(token.symbol)
        }
        return false
    }, [JSON.stringify(token)]).value
}
