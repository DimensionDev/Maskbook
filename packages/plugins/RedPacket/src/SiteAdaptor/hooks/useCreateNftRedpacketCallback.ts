import type { NetworkPluginID } from '@masknet/shared-base'
import type { NftRedPacket } from '@masknet/web3-contracts/types/NftRedPacket.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import {
    addGasMargin,
    ContractTransaction,
    decodeEvents,
    type GasConfig,
    isValidAddress,
} from '@masknet/web3-shared-evm'
import { BigNumber } from 'bignumber.js'
import { useAsyncFn } from 'react-use'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { createNftRedpacketContract } from './useNftRedPacketContract.js'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGasConfig } from '@masknet/web3-hooks-evm'

interface Options {
    publicKey: string
    duration: number
    message: string
    creator: string
    contractAddress: string
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
    const params: Parameters<NftRedPacket['methods']['create_red_packet']> = useMemo(() => {
        return [
            publicKey,
            duration,
            web3_utils.sha3(Math.random().toString())!,
            message,
            creator,
            contractAddress,
            tokenIds,
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
            if (!account) return
            const nftRedPacketContract = createNftRedpacketContract(chainId)
            if (!nftRedPacketContract) return null

            const gasLimit = await nftRedPacketContract.methods
                .create_red_packet(...params)
                .estimateGas({ from: account })
            return gasLimit
        },
    })
    const { gasPrice } = useGasConfig(chainId)

    const estimateGasFee = useMemo(() => {
        if (!gasLimit) return undefined
        if (!gasPrice || gasPrice === '0') return undefined
        return new BigNumber(gasPrice).multipliedBy(gasLimit).multipliedBy(1.5).toFixed()
    }, [gasLimit, gasPrice])

    const [{ loading }, createCallback] = useAsyncFn(async () => {
        const nftRedPacketContract = createNftRedpacketContract(chainId)
        if (!nftRedPacketContract || !isValidAddress(contractAddress) || tokenIds.length === 0 || !gasLimit) {
            return
        }

        // #region check ownership
        const checkParams: Parameters<NftRedPacket['methods']['check_ownership']> = [tokenIds, contractAddress]

        const isOwner = await nftRedPacketContract.methods.check_ownership(...checkParams).call({ from: account })
        if (!isOwner) return

        // #endregion

        const tx = await new ContractTransaction(nftRedPacketContract).fillAll(
            nftRedPacketContract.methods.create_red_packet(...params),
            {
                from: account,
                chainId,
                ...gasOption,
                gas: addGasMargin(BigNumber.max(gasLimit, gasOption?.gas ?? 0), 0.3),
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
    }, [duration, message, creator, contractAddress, tokenIds, account, chainId, gasOption, gasLimit])

    return { gasLimit, estimateGasFee, loading, createCallback }
}
