import { first } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import type { CreationSuccess } from '@masknet/web3-contracts/types/MaskBox'
import { useMaskBoxConstants } from '@masknet/web3-shared-evm'
import { useMaskBoxContract } from './useMaskBoxContract'

export function useMaskBoxCreationSuccessEvent(creatorAddress: string, tokenAddress: string, boxId: string) {
    const maskBoxContract = useMaskBoxContract()
    const { MASK_BOX_CONTRACT_FROM_BLOCK } = useMaskBoxConstants()

    return useAsyncRetry(async () => {
        if (!maskBoxContract) return null
        const events = await maskBoxContract.getPastEvents('CreationSuccess', {
            filter: {
                creator: creatorAddress,
                nft_address: tokenAddress,
                box_id: boxId,
            },
            fromBlock: MASK_BOX_CONTRACT_FROM_BLOCK,
        })
        const filtered = (events as unknown as CreationSuccess[]).filter((evt) => evt.returnValues.box_id === boxId)
        return first(filtered)
    }, [boxId, creatorAddress, tokenAddress, maskBoxContract, MASK_BOX_CONTRACT_FROM_BLOCK])
}
