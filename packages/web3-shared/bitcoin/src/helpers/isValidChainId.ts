import { type ChainId } from '../types/index.js'
import { ChainIdList } from '../constants/index.js'

export function isValidChainId(chainId?: ChainId): chainId is ChainId {
    return ChainIdList.some((x) => x === chainId)
}
