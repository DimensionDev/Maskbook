import type { DAOResult } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export namespace SnapshotBaseAPI {
    export interface DataSourceProvider {
        get(): Promise<Array<DAOResult<ChainId.Mainnet>>>
    }
}
