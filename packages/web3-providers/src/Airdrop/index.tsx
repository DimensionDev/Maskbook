import { type ChainId, getAirdropClaimersConstants, createContract } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../entry-helpers.js'
import { Web3API } from '../Connection/index.js'
import AirDropV2ABI from '@masknet/web3-contracts/abis/AirdropV2.json'
import type { AirdropV2 } from '@masknet/web3-contracts/types/AirdropV2.js'
import type { AbiItem } from 'web3-utils'
export class AirDropAPI {
    public Web3 = new Web3API()
    async getActivity(chainId: ChainId, address: string) {
        const web3 = this.Web3.getWeb3(chainId)

        const { CLAIMERS, CONTRACT_ADDRESS } = getAirdropClaimersConstants(chainId)

        if (!CLAIMERS || !CONTRACT_ADDRESS || !address) return

        const airdropContract = createContract<AirdropV2>(web3, CONTRACT_ADDRESS, AirDropV2ABI as AbiItem[])

        const data = await fetchJSON<Record<string, string>>(`https://cors-next.r2d2.to/?${CLAIMERS}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const eventIndex = await airdropContract?.methods.eventIndex().call()
        // TODO: event Index will be fix
        const claimEvents = await airdropContract?.methods.claimEvents('0').call()

        const isClaimed = await airdropContract?.methods.isClaimed('0', address).call()

        if (!claimEvents) return

        return {
            claimers: data,
            startTime: claimEvents?.startTime,
            endTime: claimEvents?.endTime,
            token: claimEvents?.token,
            isClaimed,
        }
    }
}
