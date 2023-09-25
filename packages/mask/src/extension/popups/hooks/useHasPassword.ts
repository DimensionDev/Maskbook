import { useEffect } from 'react'
import Services from '#services'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'

export function useHasPassword() {
    const { data: hasPassword, isLoading, refetch } = useQuery(['@@has-password'], Services.Wallet.hasPassword)

    useEffect(() => {
        return CrossIsolationMessages.events.passwordStatusUpdated.on(() => refetch())
    }, [refetch])

    return { hasPassword, loading: isLoading }
}
