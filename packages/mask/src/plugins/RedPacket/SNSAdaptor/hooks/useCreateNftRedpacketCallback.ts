import { useAsyncFn } from 'react-use'
import Web3Utils from 'web3-utils'
import { EthereumAddress } from 'wallet.ts'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { encodeContractTransaction, decodeEvents } from '@masknet/web3-shared-evm'
import { useAccount, useChainId, useWeb3Connection, useWeb3 } from '@masknet/plugin-infra/web3'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket'
import { useNftRedPacketContract } from './useNftRedPacketContract'

export function useCreateNftRedpacketCallback(
    duration: number,
    message: string,
    name: string,
    contractAddress: string,
    tokenIdList: string[],
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    const createCallback = useAsyncFn(
        async (publicKey: string) => {
            if (
                !web3 ||
                !connection ||
                !nftRedPacketContract ||
                !contractAddress ||
                !EthereumAddress.isValid(contractAddress) ||
                tokenIdList.length === 0
            ) {
                return
            }

            // #region check ownership
            type CheckMethodParameters = Parameters<NftRedPacket['methods']['check_ownership']>

            const checkParams: CheckMethodParameters = [tokenIdList, contractAddress]

            const isOwner = await nftRedPacketContract.methods.check_ownership(...checkParams).call({ from: account })

            if (!isOwner) {
                return
            }

            // #endregion

            type FillMethodParameters = Parameters<NftRedPacket['methods']['create_red_packet']>

            const params: FillMethodParameters = [
                publicKey,
                duration,
                Web3Utils.sha3(Math.random().toString())!,
                message,
                name,
                contractAddress,
                tokenIdList,
            ]

            const config = {
                from: account,
                gas: await nftRedPacketContract.methods
                    .create_red_packet(...params)
                    .estimateGas({ from: account })
                    .catch((error) => {
                        throw error
                    }),
                chainId,
            }

            const tx = await encodeContractTransaction(
                nftRedPacketContract,
                nftRedPacketContract.methods.create_red_packet(...params),
                config,
            )

            const hash = await connection.sendTransaction(tx)
            const receipt = await connection.getTransactionReceipt(hash)
            if (receipt) {
                const events = decodeEvents(web3, nftRedPacketContract.options.jsonInterface, receipt)
                return {
                    hash,
                    receipt,
                    events,
                }
            }
            return { hash, receipt }
        },
        [duration, message, name, contractAddress, connection, tokenIdList, nftRedPacketContract, account, chainId],
    )

    return createCallback
}
