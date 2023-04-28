import type { AirdropV2 } from '@masknet/web3-contracts/types/AirdropV2.js'
import { useChainContext, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useContract } from '@masknet/web3-hooks-evm'
import { useAirdropClaimersConstants, type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import AirDropV2ABI from '@masknet/web3-contracts/abis/AirdropV2.json'
import type { AbiItem } from 'web3-utils'
import { useAsyncFn } from 'react-use'
import { toFixed } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { utils } from 'ethers'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { PluginClaimMessage } from '../message.js'

export function useClaimAirDrop(
    chainId: ChainId,
    eventIndex: number,
    callback: () => void,
    merkleProof?: string[],
    amount?: string,
    tokenAddress?: string,
) {
    const { account } = useChainContext()
    const { CONTRACT_ADDRESS } = useAirdropClaimersConstants(chainId)
    const airdropContract = useContract<AirdropV2>(chainId, CONTRACT_ADDRESS, AirDropV2ABI as AbiItem[])
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })

    const { setDialog } = useRemoteControlledDialog(PluginClaimMessage.claimSuccessDialogEvent)
    return useAsyncFn(async () => {
        if (!airdropContract || !connection || !amount || !merkleProof) return

        const tx = await new ContractTransaction(airdropContract).fillAll(
            airdropContract.methods.claim(eventIndex, merkleProof, account, utils.parseEther(amount)),
            {
                from: account,
                gas: toFixed(
                    await airdropContract.methods
                        .claim(eventIndex, merkleProof, account, utils.parseEther(amount))
                        .estimateGas({ from: account }),
                ),
                chainId,
            },
        )

        const hash = await connection.sendTransaction(tx)
        const receipt = await connection.getTransactionReceipt(hash)

        if (receipt) {
            callback()
            setDialog({
                open: true,
                token: tokenAddress,
                amount,
            })
        }
    }, [airdropContract, account, amount, merkleProof, connection, eventIndex])
}
