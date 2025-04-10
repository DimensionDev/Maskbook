import { type NameServiceID, type StorageItem } from '@masknet/shared-base'
import { formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { NameServiceState } from '../../Base/state/NameService.js'
import * as ENS from /* webpackDefer: true */ '../../../ENS/index.js'
import * as SpaceID from /* webpackDefer: true */ '../../../SpaceID/index.js'
import type { NameServiceAPI } from '../../../entry-types.js'

export class EVMNameService extends NameServiceState {
    constructor(storage: StorageItem<Record<NameServiceID, Record<string, string>>>) {
        super(storage, (x) => isValidAddress(x) && !isZeroAddress(x), formatEthereumAddress)
    }

    override createResolvers(domainOnly?: boolean) {
        if (domainOnly) return [ENS.ENS, SpaceID.SpaceID] as NameServiceAPI.Provider[]
        return [ENS.ENS, SpaceID.SpaceID] as NameServiceAPI.Provider[]
    }
}
