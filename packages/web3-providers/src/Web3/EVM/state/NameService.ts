import type { NameServiceID, StorageItem } from '@masknet/shared-base'
import { formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { NameServiceState } from '../../Base/state/NameService.js'
import defer * as ENS from '../../../ENS/index.js'
import defer * as SpaceID from '../../../SpaceID/index.js'
import type { NameServiceAPI } from '../../../entry-types.js'

export class EVMNameService extends NameServiceState {
    constructor(storage: StorageItem<{ [nameServiceId in NameServiceID]: { [property: string]: string } }>) {
        super(storage, (x) => isValidAddress(x) && !isZeroAddress(x), formatEthereumAddress)
    }

    override createResolvers(domainOnly?: boolean) {
        if (domainOnly) return [ENS.ENS, SpaceID.SpaceID] as NameServiceAPI.Provider[]
        return [ENS.ENS, SpaceID.SpaceID] as NameServiceAPI.Provider[]
    }
}
