import { memoize } from 'lodash-es'
import type { BaseHubOptions } from './HubOptions.js'

function resolver<ChainId>(initial?: BaseHubOptions<ChainId>) {
    return [initial?.chainId, initial?.account, initial?.currencyType, initial?.sourceType].join(',')
}

export function createHubMemoized<F extends (initial?: BaseHubOptions<any>) => any>(creator: F): F {
    return memoize(creator, resolver)
}
