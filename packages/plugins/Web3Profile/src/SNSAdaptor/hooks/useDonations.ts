import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsync'
import { EMPTY_LIST } from '@masknet/shared-base'
import { getDonations } from '../api'
import type { GeneralAsset } from '../types'

export function useDonations(address: string): AsyncState<GeneralAsset[]> {
    return useAsync(async () => {
        const response = await getDonations(address)
        return response.status ? response.assets : EMPTY_LIST
    }, [address])
}
