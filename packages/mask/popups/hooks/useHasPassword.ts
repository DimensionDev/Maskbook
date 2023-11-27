import { useEffect } from 'react'
import Services from '#services'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useHasPassword() {
    const {
        data: hasPassword,
        isPending,
        refetch,
    } = useQuery({ queryKey: ['@@has-password'], queryFn: Services.Wallet.hasPassword, networkMode: 'always' })

    useEffect(() => {
        refetch()
        return CrossIsolationMessages.events.passwordStatusUpdated.on(() => refetch())
    }, [])

    return { hasPassword, isPending }
}
