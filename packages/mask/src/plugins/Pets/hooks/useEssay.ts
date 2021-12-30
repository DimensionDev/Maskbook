import { ImageType, ShowMeta } from './../types'
import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { PluginPetRPC } from '../messages'
import type { User, FilterContract } from '../types'
import { DEFAULT_WORD } from '../constants'

export function useEssay(user: User, refresh?: boolean) {
    return useAsync(async () => {
        if (user.address) {
            return PluginPetRPC.getEssay(user.address)
        }
        return null
    }, [user, refresh]).value
}

export function useDefaultEssay(nfts: FilterContract[]) {
    const [essayMeta, setEssayMeta] = useState<ShowMeta | undefined>(undefined)
    useEffect(() => {
        const filter = nfts.filter((y) => y.tokens.length > 0)
        if (filter.length) {
            setEssayMeta({
                image: filter[0].tokens[0]?.mediaUrl ?? '',
                word: DEFAULT_WORD,
                type: filter[0].tokens[0]?.glbSupport ? ImageType.GLB : ImageType.NORMAL,
            })
        } else {
            setEssayMeta(undefined)
        }
    }, [nfts])
    return essayMeta
}
