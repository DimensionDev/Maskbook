import { ImageType, ShowMeta } from './../types'
import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { PluginPetRPC } from '../messages'
import type { User } from '../types'
import { Punk3D, DEFAULT_SET_WORD, MASK_TWITTER, DEFAULT_PUNK_MASK_WORD, PunkIcon } from './../constants'

export function useEssay(user: User, refresh?: number) {
    return useAsync(async () => {
        if (!user.address) return null
        const metaData = await PluginPetRPC.getEssay(user.address)
        return metaData?.userId === user.userId ? metaData : null
    }, [user, refresh]).value
}

export function useDefaultEssay(user: User) {
    const [essayMeta, setEssayMeta] = useState<ShowMeta | undefined>(undefined)
    useEffect(() => {
        if (user?.userId || user?.userId !== '$unknown') {
            setEssayMeta({
                image: user.userId === MASK_TWITTER ? Punk3D.url : PunkIcon,
                word: user.userId === MASK_TWITTER ? DEFAULT_PUNK_MASK_WORD : DEFAULT_SET_WORD,
                type: user.userId === MASK_TWITTER ? ImageType.GLB : ImageType.NORMAL,
            })
        } else {
            setEssayMeta(undefined)
        }
    }, [user])
    return essayMeta
}
