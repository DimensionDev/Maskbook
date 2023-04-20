import type { SnapshotTwitterBinding } from '@masknet/web3-shared-base'

export namespace SnapshotBaseAPI {
    export interface DataSourceProvider {
        get(): Promise<SnapshotTwitterBinding[]>
    }
}
