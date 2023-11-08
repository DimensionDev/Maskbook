import { memoize } from 'lodash-es'
import type { HubOptions_Base } from './HubOptionsAPI.js'

function resolver<ChainId>(initial?: HubOptions_Base<ChainId>) {
    return [initial?.chainId, initial?.account, initial?.currencyType, initial?.sourceType].join(',')
}

export function createHubMemoized<F extends (initial?: HubOptions_Base<any>) => any>(creator: F): F {
    return memoize(creator, resolver)
}
