import { MaskMessages } from '@masknet/shared-base'
import Services from '#services'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export function useLanguage() {
    const { data, refetch } = useSuspenseQuery({
        queryKey: ['shared-ui', 'useLanguage'],
        queryFn: Services.Settings.getLanguage,
        networkMode: 'always',
    })
    useEffect(() => MaskMessages.events.languageSettings.on(() => refetch()), [refetch])
    return data
}
