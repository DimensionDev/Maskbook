import { useEffect, useState } from 'react'
import type { GeneralAssetWithTags } from '../common/types'
import utils from '../common/utils'

export function useDonations() {
    const [donations, setDonations] = useState<GeneralAssetWithTags[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        utils
            .initAssets('Gitcoin-Donation')
            .then(({ listed }) => {
                setDonations(listed)
            })
            .finally(() => setIsLoading(false))
    }, [])

    return {
        donations,
        loading: isLoading,
    }
}
