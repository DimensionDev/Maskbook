import { type ChainId, getAirdropClaimersConstants } from '@masknet/web3-shared-evm'
import { EVMContractReadonly } from '../Web3/EVM/apis/ContractReadonlyAPI.js'
import { fetchJSON } from '../helpers/fetchJSON.js'

export class Airdrop {
    static async getActivity(chainId: ChainId, address?: string) {
        const { CLAIMERS, CONTRACT_ADDRESS } = getAirdropClaimersConstants(chainId)
        if (!CLAIMERS || !CONTRACT_ADDRESS) return

        const airdropContract = EVMContractReadonly.getAirdropV2Contract(CONTRACT_ADDRESS, { chainId })
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

    static async getPoolInfo(chainId: ChainId, eventIndex: string) {
        const { CONTRACT_ADDRESS } = getAirdropClaimersConstants(chainId)
        if (!CONTRACT_ADDRESS) return

        const airdropContract = EVMContractReadonly.getAirdropV2Contract(CONTRACT_ADDRESS, { chainId })
        return airdropContract?.methods.claimEvents(eventIndex).call()
    }
}
