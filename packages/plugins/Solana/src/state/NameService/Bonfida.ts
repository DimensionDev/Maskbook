import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { NameServiceID } from '@masknet/shared-base'
import { lookup, reverse } from '../../apis/index.js'
import type { ChainId } from '@masknet/web3-shared-solana'

export class BonfidaResolver implements NameServiceResolver<ChainId> {
    public get id() {
        return NameServiceID.SOLANA
    }
    lookup = lookup
    reverse = reverse
}
