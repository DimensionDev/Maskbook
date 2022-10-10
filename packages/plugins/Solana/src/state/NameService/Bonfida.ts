import type { NameServiceResolver } from '@masknet/web3-state'
import type { ChainId } from '@masknet/web3-shared-solana'
import { lookup, reverse } from '../../apis/index.js'

export class BonfidaResolver implements NameServiceResolver<ChainId> {
    lookup = lookup
    reverse = reverse
}
