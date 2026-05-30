import { toHex, type NetworkPluginID } from '@masknet/shared-base'
import { NftRedPacketAbi } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { useGasConfig } from '@masknet/web3-hooks-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import {
    addGasMargin,
    ContractTransaction,
    decodeEvents,
    type GasConfig,
    isValidAddress,
    type MultipleAbiEventsToMappedObject,
    type TransactionReceipt,
} from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from 'bignumber.js'
import { useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { createNftRedpacketContract } from './useNftRedPacketContract.js'
import { encodeFunctionData, keccak256 } from 'viem'
import type { AbiParametersToPrimitiveTypes, ExtractAbiFunction } from 'abitype'

interface Options {
    publicKey: HexString
    duration: number
    message: string
    creator: string
    contractAddress: HexString
    tokenIds: string[]
    gasOption?: GasConfig
}

export function useCreateNftRedpacketCallback({
    publicKey,
    duration,
    message,
    creator,
    contractAddress,
    tokenIds,
    gasOption,
}: Options) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const params = useMemo((): AbiParametersToPrimitiveTypes<
        ExtractAbiFunction<NftRedPacketAbi, 'create_red_packet'>['inputs'],
        'inputs',
        true
    > => {
        return [
            publicKey,
            BigInt(duration),
            keccak256(toHex(Math.random().toString())),
            message,
            creator,
            contractAddress,
            tokenIds.map(BigInt),
        ]
    }, [publicKey, duration, message, creator, contractAddress, tokenIds])

    const { data: gasLimit } = useQuery({
        queryKey: [
            'create-nft-red-packet',
            'gas',
            chainId,
            contractAddress,
            account,
            publicKey,
            creator,
            message,
            tokenIds,
            params,
        ],
        refetchInterval: 10,
        queryFn: async () => {
            if (!account || !contractAddress) return null
            const nftRedPacketContract = createNftRedpacketContract(chainId)
            if (!nftRedPacketContract) return null

            const gasLimit = await nftRedPacketContract.estimateGas.create_red_packet(params, {
                account: account as HexString,
            })
            return gasLimit
        },
    })
    const { gasPrice } = useGasConfig(chainId)

    const estimateGasFee = useMemo(() => {
        if (!gasLimit) return undefined
        if (!gasPrice || gasPrice === '0') return undefined
        return new BigNumber(gasPrice).multipliedBy(String(gasLimit)).multipliedBy(1.5).toFixed()
    }, [gasLimit, gasPrice])

    const [{ loading }, createCallback] = useAsyncFn(async (): Promise<
        | undefined
        | {
              hash: string
              receipt: TransactionReceipt
              events: undefined | MultipleAbiEventsToMappedObject<NftRedPacketAbi>
          }
        | undefined
    > => {
        const nftRedPacketContract = createNftRedpacketContract(chainId)
        if (!nftRedPacketContract || !isValidAddress(contractAddress) || tokenIds.length === 0 || !gasLimit) {
            return
        }

        // #region check ownership
        const isOwner = await nftRedPacketContract.read.check_ownership([tokenIds.map(BigInt), contractAddress], {
            account: (account || undefined) as HexString | undefined,
        })
        if (!isOwner) return

        // #endregion
        const tx = ContractTransaction.normalizeTransaction({
            from: account,
            chainId,
            ...gasOption,
            gas: addGasMargin(BigNumber.max(String(gasLimit), gasOption?.gas ?? 0), 0.3),
            to: nftRedPacketContract.address,
            data: encodeFunctionData({
                abi: NftRedPacketAbi,
                functionName: 'create_red_packet',
                args: params,
            }),
        })

        const hash = await EVMWeb3.sendTransaction(tx, {
            paymentToken: gasOption?.gasCurrency,
            gasOptionType: gasOption?.gasOptionType,
        })
        const receipt = await EVMWeb3.getTransactionReceipt(hash)
        if (receipt) {
            return {
                hash,
                receipt,
                events: decodeEvents(NftRedPacketAbi, receipt.logs),
            }
        }
        return { hash, receipt, events: undefined }
    }, [duration, message, creator, contractAddress, tokenIds, account, chainId, gasOption, gasLimit, params])

    return { gasLimit, estimateGasFee, loading, createCallback }
}
