import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-solana'
import { NetworkState } from '../../Base/state/Network.js'

export class SolanaNetwork extends NetworkState<ChainId, SchemaType, NetworkType> {}
