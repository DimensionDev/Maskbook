import { type ChainId, getAirdropClaimersConstants } from '@masknet/web3-shared-evm'
import type { AirdropV2Abi } from '@masknet/web3-contracts/types/AirdropV2.js'
import type { Address, ContractFunctionReturnType } from 'viem'
import { EVMContractReadonly } from '../Web3/EVM/apis/ContractReadonlyAPI.js'
import { fetchJSON } from '../helpers/fetchJSON.js'

type ClaimEvent = {
    token: string
    startTime: string
    endTime: string
    merkleRoot: string
}

type ClaimEventOutput = ContractFunctionReturnType<AirdropV2Abi, 'pure' | 'view', 'claimEvents', [bigint]>

function formatClaimEvent(value: ClaimEventOutput | undefined): ClaimEvent | undefined {
    if (!value) return
    const [token, startTime, endTime, merkleRoot] = value
    return {
        token,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        merkleRoot,
    }
}

export class Airdrop {
    static async getActivity(chainId: ChainId, address?: string) {
        const { CLAIMERS, CONTRACT_ADDRESS } = getAirdropClaimersConstants(chainId)
        if (!CLAIMERS || !CONTRACT_ADDRESS) return

        const airdropContract = EVMContractReadonly.getAirdropV2Contract(CONTRACT_ADDRESS)
        const data = await fetchJSON<Record<string, string>>(`https://cors-next.r2d2.to/?${CLAIMERS}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const eventIndex = await EVMContractReadonly.readContract(airdropContract, 'eventIndex', [], {
            chainId,
        })
        const currentEventIndex = Number(eventIndex ?? 0n) - 1
        const claimEvent = await EVMContractReadonly.readContract(
            airdropContract,
            'claimEvents',
            [BigInt(currentEventIndex)],
            {
                chainId,
            },
        )
        const claimEvents = formatClaimEvent(claimEvent)
        const isClaimed = Boolean(
            address ?
                await EVMContractReadonly.readContract(
                    airdropContract,
                    'isClaimed',
                    [BigInt(currentEventIndex), address as Address],
                    {
                        chainId,
                    },
                )
            :   false,
        )

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

        const airdropContract = EVMContractReadonly.getAirdropV2Contract(CONTRACT_ADDRESS)
        const claimEvent = await EVMContractReadonly.readContract(
            airdropContract,
            'claimEvents',
            [BigInt(eventIndex)],
            { chainId },
        )
        return formatClaimEvent(claimEvent)
    }
}
