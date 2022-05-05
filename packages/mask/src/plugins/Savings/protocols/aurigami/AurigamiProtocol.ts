import type Web3 from 'web3'
import type { AbiItem } from 'web3-utils'
import { FungibleTokenDetailed, createContract } from '@masknet/web3-shared-evm'
import { ProtocolType } from '../../types'
import { default as BenQiRewardProtocol, RewardToken, PairConfig } from '../common/protocol/BenQiRewardProtocol'

import type { AuriLens } from '@masknet/web3-contracts/types/AuriLens'
import AuriLensABI from '@masknet/web3-contracts/abis/AuriLens.json'

export function getLensContract(address: string, web3: Web3) {
    return createContract<AuriLens>(web3, address, AuriLensABI as AbiItem[])
}

const rewardTokens: RewardToken[] = []

export default class AurigamiProtocol extends BenQiRewardProtocol {
    static nativeToken = 'auETH'

    constructor(
        pair: [FungibleTokenDetailed, FungibleTokenDetailed],
        allPairs: [[FungibleTokenDetailed, FungibleTokenDetailed]],
        config: PairConfig,
    ) {
        super(pair, AurigamiProtocol.nativeToken, allPairs, rewardTokens, config)
    }
    override get type() {
        return ProtocolType.Aurigami
    }
}
