import { first } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import type { CreationSuccess } from '@masknet/web3-contracts/types/MaskBox'
import { useBlockNumber, useMaskBoxConstants } from '@masknet/web3-shared-evm'
import { useMaskBoxContract } from './useMaskBoxContract'

// dynamically set the block range window size
const FRAGMENT_SIZE = 5000
const MAX_PAGE_SIZE = 10

export function useMaskBoxCreationSuccessEvent(creatorAddress: string, tokenAddress: string, boxId: string) {
    const blockNumber = useBlockNumber()
    const maskBoxContract = useMaskBoxContract()
    const { MASK_BOX_CONTRACT_FROM_BLOCK = Math.max(0, blockNumber - FRAGMENT_SIZE) } = useMaskBoxConstants()

    return useAsyncRetry(async () => {
        if (!maskBoxContract) return null

        const getPastEvents = (fromBlock: number, toBlock: number) => {
            return maskBoxContract.getPastEvents('CreationSuccess', {
                filter: {
                    creator: creatorAddress,
                    nft_address: tokenAddress,
                    box_id: boxId,
                },
                fromBlock,
                toBlock,
            })
        }

        const range = blockNumber - MASK_BOX_CONTRACT_FROM_BLOCK
        const size = Math.min(MAX_PAGE_SIZE, Math.ceil(range / FRAGMENT_SIZE))
        const allSettled = await Promise.allSettled(
            Array.from({ length: size }).map((_, index) =>
                getPastEvents(blockNumber - FRAGMENT_SIZE * (index + 1), blockNumber - FRAGMENT_SIZE * index - 1),
            ),
        )
        const events = allSettled.flatMap((x) => (x.status === 'fulfilled' ? x.value : []))
        const filtered = (events as unknown as CreationSuccess[]).filter((evt) => evt.returnValues.box_id === boxId)
        return first(filtered)
    }, [boxId, creatorAddress, tokenAddress, maskBoxContract, blockNumber, MASK_BOX_CONTRACT_FROM_BLOCK])
}
