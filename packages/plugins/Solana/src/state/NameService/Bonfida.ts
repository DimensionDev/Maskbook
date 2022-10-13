import type { NameServiceResolver } from '@masknet/web3-state'
import { lookup, reverse } from '../../apis/index.js'

export class BonfidaResolver implements NameServiceResolver {
    lookup = lookup
    reverse = reverse
}
