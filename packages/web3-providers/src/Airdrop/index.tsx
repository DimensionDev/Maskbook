import type { AbiItem } from 'web3-utils'
import { type ChainId, getAirdropClaimersConstants, createContract } from '@masknet/web3-shared-evm'
import AirDropV2ABI from '@masknet/web3-contracts/abis/AirdropV2.json'
import type { AirdropV2 } from '@masknet/web3-contracts/types/AirdropV2.js'
import { fetchJSON } from '../entry-helpers.js'
import { Web3API } from '../Connection/index.js'

export class AirdropAPI {
    public Web3 = new Web3API()

    async getActivity(chainId: ChainId, address?: string) {
        const web3 = this.Web3.getWeb3(chainId)

        const { CLAIMERS, CONTRACT_ADDRESS } = getAirdropClaimersConstants(chainId)

        if (!CLAIMERS || !CONTRACT_ADDRESS) return

        const airdropContract = createContract<AirdropV2>(web3, CONTRACT_ADDRESS, AirDropV2ABI as AbiItem[])

        const data = await fetchJSON<Record<string, string>>(`https://cors-next.r2d2.to/?${CLAIMERS}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const eventIndex = await airdropContract?.methods.eventIndex().call()

        const currentEventIndex = Number(eventIndex) - 1
        const claimEvents = await airdropContract?.methods.claimEvents(currentEventIndex).call()

        const isClaimed = address ? await airdropContract?.methods.isClaimed(currentEventIndex, address).call() : false

        if (!claimEvents) return

        return {
            claimers: data,
            startTime: claimEvents.startTime,
            endTime: claimEvents.endTime,
            token: claimEvents.token,
            isClaimed,
            eventIndex: currentEventIndex,
        }
    }

    async getPoolInfo(chainId: ChainId, eventIndex: string) {
        const web3 = this.Web3.getWeb3(chainId)

        const { CONTRACT_ADDRESS } = getAirdropClaimersConstants(chainId)

        if (!CONTRACT_ADDRESS) return

        const airdropContract = createContract<AirdropV2>(web3, CONTRACT_ADDRESS, AirDropV2ABI as AbiItem[])

        return airdropContract?.methods.claimEvents(eventIndex).call()
    }
}
