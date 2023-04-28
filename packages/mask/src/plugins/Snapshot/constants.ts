import { PluginID } from '@masknet/shared-base'
import { resolveCrossOriginURL } from '@masknet/web3-shared-base'

export const SNAPSHOT_PLUGIN_NAME = 'Snapshot'
export const SNAPSHOT_PLUGIN_ID = PluginID.Snapshot
export const SNAPSHOT_GET_SCORE_API = resolveCrossOriginURL('https://score.snapshot.org/api/scores')
export const SNAPSHOT_VOTE_DOMAIN = {
    name: 'snapshot',
    version: '0.1.4',
}
export const SNAPSHOT_IPFS = 'https://snapshot.mypinata.cloud/ipfs'
