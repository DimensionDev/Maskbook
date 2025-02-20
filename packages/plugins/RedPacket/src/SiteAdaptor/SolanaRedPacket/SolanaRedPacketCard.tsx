import { BN, web3 } from '@coral-xyz/anchor'
import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { usePostInfoDetails, usePostLink } from '@masknet/plugin-infra/content-script'
import { share } from '@masknet/plugin-infra/content-script/context'
import { LoadingStatus, TransactionConfirmModal } from '@masknet/shared'
import { type NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import {
    NetworkContextProvider,
    SOLWeb3ContextProvider,
    useChainContext,
    useNetwork,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import { SolanaChainResolver } from '@masknet/web3-providers'
import { RedPacketStatus, type SolanaRedPacketJSONPayload } from '@masknet/web3-providers/types'
import { TokenType, formatBalance, minus } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-solana'
import { Card } from '@mui/material'
import { memo, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { RedPacketEnvelope } from '../components/RedPacketEnvelope.js'
import { getClaimRecord } from '../helpers/getClaimRecord.js'
import { useSolanaAvailability } from './hooks/useAvailability.js'
import { useClaimCallback } from './hooks/useClaimCallback.js'
import { OperationFooter } from './OperationFooter.js'
import { useRedPacketCover } from '../hooks/useRedPacketCover.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            borderRadius: theme.spacing(2),
            position: 'relative',
            display: 'flex',
            backgroundColor: 'transparent',
            backgroundRepeat: 'no-repeat',
            color: theme.palette.common.white,
            flexDirection: 'column',
            gap: theme.spacing(2),
            justifyContent: 'space-between',
            margin: theme.spacing(0, 'auto', 2),
            boxSizing: 'border-box',
            width: 'calc(100% - 32px)',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: theme.spacing(1, 1.5),
                width: 'calc(100% - 20px)',
            },
            padding: 0,
            aspectRatio: '480 / 336',
        },
        footer: {
            margin: theme.spacing(2),
        },
        envelope: {
            height: '100%',
            width: '100%',
        },
    }
})

export interface SolanaRedPacketCardProps {
    payload: SolanaRedPacketJSONPayload
    currentPluginID: NetworkPluginID
}

export const SolanaRedPacketCard = memo(function SolanaRedPacketCard({
    payload,
    currentPluginID,
}: SolanaRedPacketCardProps) {
    const { _ } = useLingui()
    const token = payload.token
    const { pluginID } = useNetworkContext()

    const payloadChainId = token?.chainId ?? SolanaChainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet
    const { account } = useChainContext<NetworkPluginID.PLUGIN_SOLANA>()

    // #region token detailed
    const {
        availability,
        computed: availabilityComputed,
        refresh: refreshRedPacket,
    } = useSolanaAvailability(payload, payloadChainId)

    // #endregion

    const { canClaim, canRefund, listOfStatus } = availabilityComputed

    // #region remote controlled transaction dialog
    const postLink = usePostLink()

    const [{ loading: isClaiming, value: claimTxHash }, claimCallback] = useClaimCallback(payload)
    const source = usePostInfoDetails.source()
    const platform = source?.toLowerCase()
    const postUrl = usePostInfoDetails.url()
    const link = postLink.toString() || postUrl?.toString()

    // TODO payload.chainId is undefined on production mode
    const network = useNetwork(pluginID, payload.chainId || payload.token?.chainId)

    const claimedShareText = useMemo(() => {
        const promote_short = _(msg`🧧🧧🧧 Try sending Lucky Drop to your friends with Mask.io.`)
        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const sender = payload.sender.name.replace(/^@/, '')
        const account = isOnTwitter ? 'realMaskNetwork' : 'masknetwork'

        const claimed = _(msg`I just claimed a lucky drop from @${sender} on Solana.`)
        return isOnTwitter || isOnFacebook ?
                _(msg`${claimed} Follow @${account} (mask.io) to claim lucky drops.`) +
                    `\n${promote_short}\n#mask_io #LuckyDrop\n${link}`
            :   `${claimed}\n${promote_short}\n${link}`
    }, [payload, link, claimTxHash, network?.name, platform, _])

    const [{ loading: isClaimingAndChecking }, onClaimOrRefund] = useAsyncFn(async () => {
        let hash: string | undefined
        if (canClaim) {
            hash = await claimCallback({
                cluster: payload.network,
                accountId: payload.accountId,
                password: payload.password ?? '',
                tokenAddress: payload.token!.address,
                tokenProgram: payload.tokenProgram ? new web3.PublicKey(payload.tokenProgram) : undefined,
            })
            const claimRecord = await getClaimRecord({
                cluster: payload.network ?? 'mainnet-beta',
                accountId: payload.accountId,
                account,
            })
            if (!claimRecord?.amount.gt(new BN(0))) return

            TransactionConfirmModal.open({
                shareText: claimedShareText,
                token,
                tokenType: TokenType.Fungible,
                messageTextForNFT: _(msg`1 NFT claimed.`),
                messageTextForFT: _(
                    msg`You claimed ${formatBalance(claimRecord.amount.toString(), token?.decimals, { significant: 2 })} $${token?.symbol}.`,
                ),
                title: _(msg`Lucky Drop`),
                share: (text) => share?.(text, source ? source : undefined),
            })
            queryClient.invalidateQueries({
                queryKey: ['redpacket', 'history'],
            })
        }
        if (typeof hash === 'string') {
            refreshRedPacket()
        }
    }, [canClaim, canRefund, claimCallback, refreshRedPacket, payload.rpid, account])

    const outdated = availability?.isEmpty || (!canRefund && listOfStatus.includes(RedPacketStatus.expired))

    const { classes } = useStyles()

    // RedPacket created from Mask has no cover settings
    const { data: cover } = useRedPacketCover({
        ...payload,
        token,
        sender: payload.sender.name,
        message: payload.sender.message,
        claimedAmount: availability?.claimed_amount,
        claimed: availability?.claimed,
    })

    // the red packet can fetch without account
    if (!availability || !token) return <LoadingStatus minHeight={148} />

    return (
        <>
            <Card className={classes.root} component="article" elevation={0}>
                {/* To ensure TokenIcon can get correct pluginID */}
                <SOLWeb3ContextProvider>
                    <RedPacketEnvelope
                        className={classes.envelope}
                        cover={cover?.backgroundImageUrl || new URL('../assets/cover.png', import.meta.url).href}
                        message={payload.sender.message}
                        token={token}
                        shares={payload.shares}
                        isClaimed={availability.isClaimed}
                        isEmpty={availability.isEmpty}
                        isExpired={availability.expired}
                        claimedCount={+availability.claimed}
                        total={payload.total}
                        totalClaimed={minus(payload.total, availability.balance).toFixed()}
                        claimedAmount={availability.claimed_amount}
                        creator={payload.sender.name}
                    />
                </SOLWeb3ContextProvider>
            </Card>
            {outdated ? null : (
                <NetworkContextProvider initialNetwork={currentPluginID}>
                    {/* ChainBoundary needs to know the current network */}
                    <OperationFooter
                        className={classes.footer}
                        chainId={payloadChainId}
                        canClaim={canClaim}
                        canRefund={canRefund}
                        isClaiming={isClaiming || isClaimingAndChecking}
                        isExpired={availability.expired}
                        onClaimOrRefund={onClaimOrRefund}
                    />
                </NetworkContextProvider>
            )}
        </>
    )
})
