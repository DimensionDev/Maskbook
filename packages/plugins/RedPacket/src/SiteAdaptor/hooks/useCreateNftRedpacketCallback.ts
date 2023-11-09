import { useAsyncFn } from 'react-use'
import type { AsyncFnReturn } from 'react-use/lib/useAsync.js'
import type { EventLog, TransactionReceipt } from 'web3-core'
import { sha3 } from 'web3-utils'
import type { NetworkPluginID } from '@masknet/shared-base'
import { decodeEvents, ContractTransaction, type GasConfig, isValidAddress } from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { toFixed } from '@masknet/web3-shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'

export function useCreateNftRedpacketCallback(
    duration: number,
    message: string,
    name: string,
    contractAddress: string,
    tokenIdList: string[],
    gasOption?: GasConfig,
): AsyncFnReturn<
    (publicKey: string) => Promise<
        | {
              hash: string
              receipt: TransactionReceipt | null
              events?: {
                  [eventName: string]: EventLog | undefined
              }
          }
        | undefined
    >
> {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const nftRedPacketContract = useNftRedPacketContract(chainId)
    const createCallback = useAsyncFn(
        async (publicKey: string) => {
            if (!nftRedPacketContract || !isValidAddress(contractAddress) || tokenIdList.length === 0) {
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
                sha3(Math.random().toString())!,
                message,
                name,
                contractAddress,
                tokenIdList,
            ]

            const tx = await new ContractTransaction(nftRedPacketContract).fillAll(
                nftRedPacketContract.methods.create_red_packet(...params),
                {
                    from: account,
                    gas: toFixed(
                        await nftRedPacketContract.methods.create_red_packet(...params).estimateGas({ from: account }),
                    ),
                    chainId,
                    ...gasOption,
                },
            )

            const hash = await EVMWeb3.sendTransaction(tx, {
                paymentToken: gasOption?.gasCurrency,
                gasOptionType: gasOption?.gasOptionType,
            })
            const receipt = await EVMWeb3.getTransactionReceipt(hash)
            if (receipt) {
                const events = decodeEvents(nftRedPacketContract.options.jsonInterface, receipt.logs)
                return {
                    hash,
                    receipt,
                    events,
                }
            }
            return { hash, receipt }
        },
        [duration, message, name, contractAddress, tokenIdList, nftRedPacketContract, account, chainId, gasOption],
    )

    return createCallback
}
