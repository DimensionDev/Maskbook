import { type FungibleToken } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, type SchemaType, type ChainId } from '@masknet/web3-shared-solana'
import { useQuery } from '@tanstack/react-query'
import { getEstimatedGasByCreateWithNativeToken } from '../helpers/createWithNativeToken.js'

import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { useAccount } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { DEFAULT_DURATION } from '../../constants.js'
import { getEstimatedGasByCreateWithSplToken } from '../helpers/createWithSplToken.js'

export function useEstimateGasWithCreateSolRedpacket(
    shares: number,
    amount: number,
    isRandom: boolean,
    pubkeyForClaimSignature: string,
    message: string,
    creator: string,
    token: FungibleToken<ChainId, SchemaType> | undefined,
    cluster: SolanaWeb3.Cluster | undefined,
) {
    const solanaAccount = useAccount(NetworkPluginID.PLUGIN_SOLANA)

    return useQuery({
        queryKey: ['estimateGas', shares, amount, isRandom, pubkeyForClaimSignature, message, creator, token, cluster],
        queryFn: async () => {
            const isNativeToken = isNativeTokenAddress(token?.address)

            return (
                isNativeToken ?
                    getEstimatedGasByCreateWithNativeToken(
                        new SolanaWeb3.PublicKey(solanaAccount),
                        shares,
                        amount,
                        DEFAULT_DURATION,
                        isRandom,
                        new SolanaWeb3.PublicKey(pubkeyForClaimSignature),
                        message,
                        creator,
                        cluster,
                    )
                : token ?
                    getEstimatedGasByCreateWithSplToken(
                        new SolanaWeb3.PublicKey(solanaAccount),
                        new SolanaWeb3.PublicKey(token.address),
                        shares,
                        amount,
                        DEFAULT_DURATION,
                        isRandom,
                        new SolanaWeb3.PublicKey(pubkeyForClaimSignature),
                        message,
                        creator,
                        cluster,
                    )
                :   undefined
            )
        },
    })
}
