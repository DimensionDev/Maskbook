import { MaskMessages } from '@masknet/shared-base'
import Services from '#services'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useAppearance() {
    const { data, refetch } = useSuspenseQuery({
        queryKey: ['shared-ui', 'useAppearance'],
        queryFn: Services.Settings.getTheme,
        networkMode: 'always',
    })
    useEffect(() => MaskMessages.events.appearanceSettings.on(() => refetch()), [refetch])
    return data
}
