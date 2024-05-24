import { useAsyncFn } from 'react-use'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types.js'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { EVMContract } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import { isValidAddress, type GasConfig, TransactionEventType, type ChainId } from '@masknet/web3-shared-evm'

export function useERC721TokenTransferCallback(address?: string, expectedChainId?: ChainId) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })

    return useAsyncFn(
        async (tokenId?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !address || !recipient || !tokenId) return

            // error: invalid recipient address
            if (!isValidAddress(recipient)) return

            const contract = EVMContract.getERC721Contract(address, { chainId })
            if (!contract) return

            // error: invalid ownership
            const ownerOf = await contract.methods.ownerOf(tokenId).call()

            if (!ownerOf || !isSameAddress(ownerOf, account)) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await contract.methods
                    .transferFrom(account, recipient, tokenId)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error) => {
                        throw error
                    }),
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>((resolve, reject) => {
                contract.methods
                    .transferFrom(account, recipient, tokenId)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        reject(error)
                    })
            })
        },
        [account, chainId, address],
    )
}
