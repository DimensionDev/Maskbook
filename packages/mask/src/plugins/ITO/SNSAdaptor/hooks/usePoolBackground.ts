import { useAsync } from 'react-use'
import { getAssetAsBlobURL } from '../../../../utils'

export function usePoolBackground() {
    return useAsync(async () => getAssetAsBlobURL(new URL('../../assets/pool-background.jpg', import.meta.url)), [])
}
