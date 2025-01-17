import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useRedPacketContract } from './useRedPacketContract.js'
import { getRedpacket } from '../helpers/getRedpacket.js'
import { refundNativeToken } from '../helpers/refundNativeToken.js'
import { getTokenAccount, getTokenProgram } from '../helpers/getTokenAccount.js'
import { refundSplToken } from '../helpers/refundSplToken.js'
import { queryClient } from '@masknet/shared-base-ui'
import { useCustomSnackbar } from '@masknet/theme'
import { Trans } from '@lingui/react/macro'

export function useRefundCallback(version: number, from: string, id?: string, expectedChainId?: ChainId) {
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({ chainId: expectedChainId })
    const [isRefunded, setIsRefunded] = useState(false)
    const redPacketContract = useRedPacketContract(chainId, version)

    const [state, refundCallback] = useAsyncFn(async () => {
        if (!redPacketContract || !id) return

        setIsRefunded(false)

        const tx = await new ContractTransaction(redPacketContract).fillAll(redPacketContract.methods.refund(id), {
            from,
        })
        const hash = await EVMWeb3.sendTransaction(tx, {
            chainId,
        })
        setIsRefunded(true)
        return hash
    }, [id, redPacketContract, chainId, from])

    return [state, isRefunded, refundCallback] as const
}

export function useSolanaRefundCallback(rpid: string) {
    const { showSnackbar } = useCustomSnackbar()
    const [isRefunded, setIsRefunded] = useState(false)
    const [state, refundCallback] = useAsyncFn(async () => {
        try {
            if (!rpid) throw new Error('Failed to resolve redpacket id')
            setIsRefunded(false)
            const redpacket = await getRedpacket(rpid)
            if (redpacket.tokenType === 0) {
                await refundNativeToken(rpid, redpacket.creator)
            } else {
                const tokenMint = redpacket.tokenAddress
                const tokenProgram = await getTokenProgram(tokenMint)
                const tokenAccount = await getTokenAccount(tokenMint)
                await refundSplToken({
                    id: rpid,
                    tokenMint,
                    tokenProgram,
                    tokenAccount,
                    creator: redpacket.creator,
                })
            }

            queryClient.invalidateQueries({
                queryKey: ['redpacket', 'history'],
            })
            setIsRefunded(true)
            showSnackbar(<Trans>Refund Successfully</Trans>, { variant: 'success' })
        } catch (error) {
            if (error instanceof Error) {
                showSnackbar(error.message, { variant: 'error' })
            }
            throw error
        }
    }, [rpid])

    return [state, isRefunded, refundCallback] as const
}
