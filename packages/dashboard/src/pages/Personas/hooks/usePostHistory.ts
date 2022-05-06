import { useRef } from 'react'
import { useAsyncRetry, useUpdateEffect } from 'react-use'
import { last } from 'lodash-unified'
import type { PostInformation } from '@masknet/shared-base'
import { Services } from '../../../API'
import { PersonaContext } from './usePersonaContext'

export const usePostHistory = (network: string, page: number, size = 20) => {
    const cache = useRef<Map<number, PostInformation | undefined>>(new Map([]))
    const { currentPersona } = PersonaContext.useContainer()

    useUpdateEffect(() => {
        cache.current = new Map()
    }, [network, currentPersona])

    return useAsyncRetry(async () => {
        const lastValue = cache.current.get(page - 1)
        const values = !currentPersona
            ? []
            : await Services.Crypto.queryPagedPostHistory(
                  currentPersona.identifier,
                  {
                      network,
                      userIds: currentPersona?.linkedProfiles.map((profile) => profile.identifier.userId) ?? [],
                      after: lastValue?.identifier,
                      pageOffset: page,
                  },
                  size,
              )

        cache.current.set(page, last(values))

        return values
    }, [page, size, network, currentPersona])
}
