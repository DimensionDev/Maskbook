import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            // staleTime: 20_000,
            // cacheTime: 300_000,
        },
    },
})
