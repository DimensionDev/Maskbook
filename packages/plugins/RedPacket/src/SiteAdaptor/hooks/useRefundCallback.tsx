import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useChainContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { EVMWeb3, SolanaChainResolver } from '@masknet/web3-providers'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { formatBalance } from '@masknet/web3-shared-base'
import { type ChainId, ContractTransaction } from '@masknet/web3-shared-evm'
import { type ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { Link } from '@mui/material'
import type { Cluster } from '@solana/web3.js'
import { produce } from 'immer'
import { useState } from 'react'
import { useAsyncFn } from 'react-use'
import { getRedpacket } from '../helpers/getRedpacket.js'
import { getTokenAccount, getTokenProgram } from '../helpers/getTokenAccount.js'
import { refundNativeToken } from '../helpers/refundNativeToken.js'
import { refundSplToken } from '../helpers/refundSplToken.js'
import { useRedPacketContract } from './useRedPacketContract.js'

const useStyles = makeStyles()({
    message: {
        display: 'flex',
        alignItems: 'center',
    },
    link: {
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
    },
})

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

interface SolanaRefundOptions {
    rpid: string
    chainId: SolanaChainId
    tokenSymbol: string
    tokenDecimals: number
}
export function useSolanaRefundCallback({ rpid, chainId, tokenSymbol, tokenDecimals }: SolanaRefundOptions) {
    const { classes } = useStyles()
    const { showSnackbar } = useCustomSnackbar()
    const Utils = useWeb3Utils(NetworkPluginID.PLUGIN_SOLANA)
    const [isRefunded, setIsRefunded] = useState(false)
    const { account } = useChainContext()
    const [state, refundCallback] = useAsyncFn(async () => {
        try {
            if (!rpid) throw new Error('Failed to resolve redpacket id')
            setIsRefunded(false)
            const redpacket = await getRedpacket(rpid)
            let hash: string
            if (redpacket.tokenType === 0) {
                hash = await refundNativeToken(rpid, redpacket.creator)
            } else {
                const tokenMint = redpacket.tokenAddress
                const cluster = SolanaChainResolver.network(chainId) as Cluster
                const tokenProgram = await getTokenProgram(tokenMint, cluster)
                const tokenAccount = await getTokenAccount(tokenMint, cluster)
                hash = await refundSplToken({
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

            const remain = redpacket.totalAmount.sub(redpacket.claimedAmount)
            setIsRefunded(true)
            showSnackbar(
                <span className={classes.message}>
                    <Trans>
                        Refund {formatBalance(remain.toString(), tokenDecimals, { significant: 2, isPrecise: true })}{' '}
                        {tokenSymbol} Successfully
                    </Trans>
                    <Link
                        sx={{ wordBreak: 'break-word' }}
                        className={classes.link}
                        color="inherit"
                        href={Utils.explorerResolver.transactionLink(chainId, hash)}
                        tabIndex={-1}
                        target="_blank"
                        rel="noopener noreferrer">
                        <Icons.LinkOut size={16} sx={{ ml: 0.5 }} />
                    </Link>
                </span>,
                { variant: 'success' },
            )
        } catch (error) {
            if (error instanceof Error) {
                showSnackbar(error.message, { variant: 'error' })
            }
            throw error
        }
    }, [rpid, account, chainId, tokenDecimals, tokenSymbol])

    return [state, isRefunded, refundCallback] as const
}
