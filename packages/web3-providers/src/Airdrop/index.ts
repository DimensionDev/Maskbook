import { type ChainId, getAirdropClaimersConstants } from '@masknet/web3-shared-evm'
import type { Address } from 'viem'
import { EVMContractReadonly } from '../Web3/EVM/apis/ContractReadonlyAPI.js'
import { fetchJSON } from '../helpers/fetchJSON.js'

type ClaimEvent = {
    token: string
    startTime: string
    endTime: string
    merkleRoot: string
}

function formatClaimEvent(value: unknown): ClaimEvent | undefined {
    if (!Array.isArray(value)) return
    const [token, startTime, endTime, merkleRoot] = value
    return {
        token: String(token ?? ''),
        startTime: String(startTime ?? '0'),
        endTime: String(endTime ?? '0'),
        merkleRoot: String(merkleRoot ?? ''),
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
        const claimEvents = formatClaimEvent(
            await EVMContractReadonly.readContract(airdropContract, 'claimEvents', [BigInt(currentEventIndex)], {
                chainId,
            }),
        )
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
        return formatClaimEvent(
            await EVMContractReadonly.readContract(airdropContract, 'claimEvents', [BigInt(eventIndex)], { chainId }),
        )
    }
}
