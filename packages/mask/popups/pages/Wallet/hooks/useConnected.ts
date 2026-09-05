import { useQuery } from '@tanstack/react-query'

// Mask no longer tracks per-origin wallet connection grants (that lived in the
// removed entry-sdk permission model); external wallets manage their own site
// connections, so this always reports nothing connected.
export function useConnectedWallets(_origin: string | null) {
    return useQuery({
        queryKey: ['origin-connected-wallets', _origin],
        queryFn: async () => new Set<string>(),
        networkMode: 'always',
    })
}
