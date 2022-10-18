import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/web3-state'
import { ChainId, formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { ENS_Resolver } from './NameService/ENS.js'
import { BNS_Resolver } from './NameService/BNS.js'
import { ChainbaseResolver } from './NameService/Chainbase.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, {
            isValidName: (x) => x !== '0x',
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress: formatEthereumAddress,
        })
    }

    override createResolvers(chainId?: ChainId) {
        if (chainId === ChainId.BSC) return [new BNS_Resolver()]
        return [new ENS_Resolver(), new ChainbaseResolver()]
    }
}
