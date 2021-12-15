import { useEffect, useState } from 'react'
import type { GeneralAssetWithTags } from '../common/types'
import utils from '../common/utils'

export function useFootprints() {
    const [footprints, setFootprints] = useState<GeneralAssetWithTags[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        utils
            .initAssets('POAP')
            .then(({ listed }) => {
                setFootprints(listed)
            })
            .finally(() => setIsLoading(false))
    }, [])

    return {
        footprints,
        loading: isLoading,
    }
}
