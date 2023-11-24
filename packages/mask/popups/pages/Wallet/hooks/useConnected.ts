import { useQuery } from '@tanstack/react-query'
import Services from '#services'

export function useConnectedWallets(origin: string | null) {
    return useQuery({
        queryKey: ['origin-connected-wallets', origin],
        queryFn: async () => {
            if (origin === null) {
                const result = await Services.Helper.queryCurrentActiveTab()
                if (!result.url || !URL.canParse(result.url)) return null
                origin = new URL(result.url).origin
            }
            const connected = await Services.Wallet.getAllConnectedWallets(origin, 'any')
            return connected
        },
        networkMode: 'always',
    })
}
