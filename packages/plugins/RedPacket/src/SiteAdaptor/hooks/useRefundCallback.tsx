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
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { produce } from 'immer'

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
    const { account } = useChainContext()
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

            queryClient.setQueriesData<{ pages: Array<{ data: FireflyRedPacketAPI.RedPacketSentInfo[] }> }>(
                {
                    queryKey: ['redpacket', 'history', account, FireflyRedPacketAPI.ActionType.Send],
                },
                (old) => {
                    if (!old) return old

                    return produce(old, (draft) => {
                        for (const page of draft.pages) {
                            if (!page) continue
                            for (const record of page.data) {
                                if (record.redpacket_id !== rpid) continue
                                record.redpacket_status = FireflyRedPacketAPI.RedPacketStatus.Refund
                            }
                        }
                    })
                },
            )

            setIsRefunded(true)
            showSnackbar(<Trans>Refund Successfully</Trans>, { variant: 'success' })
        } catch (error) {
            if (error instanceof Error) {
                showSnackbar(error.message, { variant: 'error' })
            }
            throw error
        }
    }, [rpid, account])

    return [state, isRefunded, refundCallback] as const
}
