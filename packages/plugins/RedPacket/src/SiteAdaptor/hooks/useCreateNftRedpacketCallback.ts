import { useAsyncFn } from 'react-use'
import type { AsyncFnReturn } from 'react-use/lib/useAsync.js'
import type { EventLog, TransactionReceipt } from 'web3-core'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import type { NetworkPluginID } from '@masknet/shared-base'
import {
    decodeEvents,
    ContractTransaction,
    type GasConfig,
    isValidAddress,
    addGasMargin,
} from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useNftRedPacketContract } from './useNftRedPacketContract.js'
import { BigNumber } from 'bignumber.js'

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
            const checkParams: Parameters<NftRedPacket['methods']['check_ownership']> = [tokenIdList, contractAddress]

            const isOwner = await nftRedPacketContract.methods.check_ownership(...checkParams).call({ from: account })
            if (!isOwner) return

            // #endregion

            const params: Parameters<NftRedPacket['methods']['create_red_packet']> = [
                publicKey,
                duration,
                web3_utils.sha3(Math.random().toString())!,
                message,
                name,
                contractAddress,
                tokenIdList,
            ]

            const estimateGas = await nftRedPacketContract.methods
                .create_red_packet(...params)
                .estimateGas({ from: account })
            const tx = await new ContractTransaction(nftRedPacketContract).fillAll(
                nftRedPacketContract.methods.create_red_packet(...params),
                {
                    from: account,
                    chainId,
                    ...gasOption,
                    gas: addGasMargin(BigNumber.max(estimateGas, gasOption?.gas ?? 0), 0.3),
                },
            )

            const hash = await EVMWeb3.sendTransaction(tx, {
                paymentToken: gasOption?.gasCurrency,
                gasOptionType: gasOption?.gasOptionType,
            })
            const receipt = await EVMWeb3.getTransactionReceipt(hash)
            if (receipt) {
                return {
                    hash,
                    receipt,
                    events: decodeEvents(nftRedPacketContract.options.jsonInterface, receipt.logs),
                }
            }
            return { hash, receipt }
        },
        [duration, message, name, contractAddress, tokenIdList, nftRedPacketContract, account, chainId, gasOption],
    )

    return createCallback
}
