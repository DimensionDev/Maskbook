import { useAsyncFn } from 'react-use'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types.js'
import { isSameAddress } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { isValidAddress, type GasConfig, TransactionEventType } from '@masknet/web3-shared-evm'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useERC721TokenContract } from './useERC721TokenContract.js'

export function useERC721TokenTransferCallback(address?: string) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const erc721Contract = useERC721TokenContract(chainId, address)

    return useAsyncFn(
        async (tokenId?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !recipient || !tokenId || !erc721Contract) return

            // error: invalid recipient address
            if (!isValidAddress(recipient)) return

            // error: invalid ownership
            const ownerOf = await erc721Contract.methods.ownerOf(tokenId).call()

            if (!ownerOf || !isSameAddress(ownerOf, account)) return

            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await erc721Contract.methods
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
            return new Promise<string>(async (resolve, reject) => {
                erc721Contract.methods
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
        [account, erc721Contract],
    )
}
