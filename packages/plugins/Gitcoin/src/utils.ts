import type { ChainId } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import { TenantToChainMap, type TenantTypes } from './constants.js'

export function getSupportedChainIds(tenants: TenantTypes[]): ChainId[] {
    return compact(tenants.map((tenant) => TenantToChainMap[tenant])).flat()
}
