import { ImageType, ShowMeta } from './../types'
import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { PluginPetRPC } from '../messages'
import type { User } from '../types'
import { Punk3D, DEFAULT_SET_WORD, MASK_TWITTER, DEFAULT_PUNK_MASK_WORD, PunkIcon } from './../constants'
import { useUser } from './useUser'

export function useEssay(user: User, refresh?: number) {
    return useAsync(async () => {
        if (!user.address) return null
        const metaData = await PluginPetRPC.getEssay(user.address)
        return metaData?.userId === user.userId ? metaData : null
    }, [user, refresh]).value
}

export function useDefaultEssay(user: User) {
    const [essayMeta, setEssayMeta] = useState<ShowMeta | undefined>(undefined)
    const profileUser = useUser()
    useEffect(() => {
        if (user?.userId || user?.userId !== '$unknown') {
            const isProfile = user.userId === profileUser.userId
            const isMASK = user.userId === MASK_TWITTER
            setEssayMeta({
                image: isMASK ? Punk3D.url : isProfile ? PunkIcon : '',
                word: isMASK ? DEFAULT_PUNK_MASK_WORD : DEFAULT_SET_WORD,
                type: isMASK ? ImageType.GLB : ImageType.NORMAL,
                contract: '',
                tokenId: '',
                chainId: undefined,
            })
        } else {
            setEssayMeta(undefined)
        }
    }, [user, profileUser])
    return essayMeta
}
