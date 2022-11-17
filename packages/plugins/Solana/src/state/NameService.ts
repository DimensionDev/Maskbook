import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/web3-state'
import { ChainId, formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { BonfidaResolver } from './NameService/Bonfida.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(context?: Plugin.Shared.SharedContext) {
        super(context!, {
            isValidName: (x) => isValidDomain(x),
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress,
        })
    }

    override createResolvers(chainId: ChainId) {
        return [new BonfidaResolver()]
    }
}
