import { useAsync } from 'react-use'
import { FungibleToken } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'

const ENV = {
    production: 'https://api.transak.com/api/v2/currencies/crypto-currencies',
    development: 'https://staging-api.transak.com/api/v2/currencies/crypto-currencies',
    test: 'https://development-api.transak.com/api/v2/currencies/crypto-currencies',
}

const URL = ENV[process.env.NODE_ENV]

export function useTransakAllowanceCoin(token: FungibleToken<ChainId, SchemaType>): boolean {
    return useAsync(async () => {
        if (token.address) {
            const allowanceList = await fetch(URL, { method: 'GET' })
                .then((res) => res.json())
                .then((res) => res.response)
            return allowanceList.map((val: { symbol: string }) => val.symbol).includes(token.symbol)
        }
        return false
    }).value
}
