import { useAsync } from 'react-use'
import Services from '../../../extension/service'

export function useAvailablePlatforms(keyword: string) {
    return useAsync(() => Services.Plugin.invokePlugin('maskbook.trader', 'getAvailableDataProviders', keyword), [
        keyword,
    ])
}
