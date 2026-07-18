import { msg } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { usePostInfoPostID, usePostInfoSource, usePostInfoURL, usePostLink } from '@masknet/plugin-infra/content-script'
import { share } from '@masknet/plugin-infra/content-script/context'
import { LoadingStatus, TransactionConfirmModal } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { NetworkContextProvider, useChainContext, useNetwork } from '@masknet/web3-hooks-base'
import { EVMChainResolver, EVMContract } from '@masknet/web3-providers'
import { RedPacketStatus, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { TokenType, formatBalance, isZero, minus } from '@masknet/web3-shared-base'
import { ChainId, useRedPacketConstant } from '@masknet/web3-shared-evm'
import { Card, Grow, Link } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { RedPacketEnvelope } from '../components/RedPacketEnvelope.js'
import { Conditions } from '../Conditions/index.js'
import { formatRedPacketAvailability } from '../hooks/useAvailability.js'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed.js'
import { useClaimCallback } from '../hooks/useClaimCallback.js'
import { useIsFireflyRedpacket } from '../hooks/useIsFireflyRedpacket.js'
import { useRedPacketContract } from '../hooks/useRedPacketContract.js'
import { useRedPacketCover } from '../hooks/useRedPacketCover.js'
import { useRefundCallback } from '../hooks/useRefundCallback.js'
import { OperationFooter } from './OperationFooter.js'
import { ClaimOnFirefly } from '../components/ClaimOnFirefly.js'
import type { Hex } from 'viem'

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
            display: 'flex',
            height: 40,
            gap: theme.spacing(0.5),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 99,
            fontSize: 14,
            fontWeight: 700,
            backgroundColor: theme.palette.maskColor.dark,
            color: 'white',
            cursor: 'pointer',
            textDecoration: 'none !important',
        },
        envelope: {
            height: '100%',
            width: '100%',
        },
        conditions: {
            position: 'absolute',
            zIndex: 9,
            inset: 24,
            margin: 'auto',
        },
    }
})

export interface RedPacketProps {
    payload: RedPacketJSONPayload
    currentPluginID: NetworkPluginID
}

export const RedPacket = memo(function RedPacket({ payload, currentPluginID }: RedPacketProps) {
    const { _ } = useLingui()
    const token = payload.token
    const redpacketChainId: ChainId =
        (token?.chainId as ChainId) ?? EVMChainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // #region token detailed
    const {
        availability,
        computed: availabilityComputed,
        checkAvailability,
        claimStrategyStatus,
        recheckClaimStatus,
        checkingClaimStatus,
    } = useAvailabilityComputed(account, payload)

    // #endregion

    const { canClaim, canRefund, listOfStatus, isClaimed, isEmpty, isExpired, isRefunded } = availabilityComputed

    // #region remote controlled transaction dialog
    const postLink = usePostLink()

    const [{ loading: isClaiming }, claimCallback] = useClaimCallback(account, payload)
    const source = usePostInfoSource()
    const postUrl = usePostInfoURL()
    const link = postLink.toString() || postUrl?.toString()
    const isFireflyRedpacket = useIsFireflyRedpacket()
    const postId = usePostInfoPostID()

    const network = useNetwork<NetworkPluginID.PLUGIN_EVM>(NetworkPluginID.PLUGIN_EVM, redpacketChainId)

    const claimedShareText = useMemo(() => {
        const promote_short = _(msg`🧧🧧🧧 Try sending Lucky Drop to your friends with Mask.io.`)
        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const shareTextOption = {
            sender: payload.sender.name.replace(/^@/u, ''),
            payload: link!,
            network: network?.name ?? 'Mainnet',
            account: 'masknetwork',
            interpolation: { escapeValue: false },
        }
        const claimed = _(
            msg`I just claimed a lucky drop from @${shareTextOption.sender} on ${shareTextOption.network} network.`,
        )
        return isOnTwitter || isOnFacebook ?
                _(msg`${claimed} Follow @${shareTextOption.account} (mask.io) to claim lucky drops.`) +
                    `\n${promote_short}\n#mask_io #LuckyDrop\n${shareTextOption.payload}`
            :   `${claimed}\n${promote_short}\n${shareTextOption.payload}`
    }, [payload, link, network?.name, _])

    const [{ loading: isRefunding }, _isRefunded, refundCallback] = useRefundCallback(
        payload.contract_version,
        account,
        payload.rpid,
        redpacketChainId,
    )

    const redPacketContract = useRedPacketContract(redpacketChainId, payload.contract_version)
    const checkResult = useCallback(async () => {
        if (!redPacketContract) return
        const data = formatRedPacketAvailability(
            await EVMContract.readContract(redPacketContract, 'check_availability', [payload.rpid as Hex], {
                chainId: redpacketChainId,
                // check availability is ok w/o account
                from: account,
            }),
        )
        if (!data) return
        if (isZero(data.claimed_amount)) return
        TransactionConfirmModal.open({
            shareText: claimedShareText,
            token,
            tokenType: TokenType.Fungible,
            messageTextForNFT: _(msg`1 NFT claimed.`),
            messageTextForFT: _(
                msg`You claimed ${formatBalance(data.claimed_amount, token?.decimals, { significant: 2 })} $${token?.symbol || ''}.`,
            ),
            title: _(msg`Lucky Drop`),
            share: (text) => share?.(text, source || undefined),
        })
    }, [redPacketContract, payload.rpid, redpacketChainId, account, claimedShareText, token, _, source])

    const [showRequirements, setShowRequirements] = useState(false)
    const onClaimOrRefund = useCallback(async () => {
        let hash: string | undefined
        if (canClaim) {
            const result = await recheckClaimStatus()
            if (result === false) {
                setShowRequirements(true)
                return
            }
            hash = await claimCallback()
            await checkResult()
            queryClient.invalidateQueries({
                queryKey: ['redpacket', 'history'],
            })
        } else if (canRefund) {
            hash = await refundCallback()
        }
        if (typeof hash === 'string') {
            checkAvailability()
        }
    }, [canClaim, canRefund, recheckClaimStatus, claimCallback, checkResult, refundCallback, checkAvailability])

    const outdated = isEmpty || (!canRefund && listOfStatus.includes(RedPacketStatus.expired))

    const { classes } = useStyles()

    // RedPacket created from Mask has no cover settings
    const { data: cover, isLoading: isLoadingCover } = useRedPacketCover({
        ...payload,
        token,
        sender: payload.sender.name,
        message: payload.sender.message,
        claimedAmount: availability?.claimed_amount,
        claimed: availability?.claimed,
    })

    const contractAddress = useRedPacketConstant(redpacketChainId, 'HAPPY_RED_PACKET_ADDRESS_V4')
    if (!contractAddress) {
        return <ClaimOnFirefly />
    }

    // the red packet can fetch without account
    if (!availability || !token || isLoadingCover) return <LoadingStatus sx={{ minHeight: 148 }} />
    const unsatisfied = !!account && claimStrategyStatus?.canClaim === false && !isClaimed

    const card = (
        <Card className={classes.root} component="article" elevation={0}>
            <RedPacketEnvelope
                className={classes.envelope}
                cover={cover?.backgroundImageUrl || new URL('../assets/cover.png', import.meta.url).href}
                message={payload.sender.message}
                token={token}
                shares={payload.shares}
                isClaimed={isClaimed}
                isEmpty={isEmpty}
                isExpired={isExpired}
                isRefunded={isRefunded}
                hideContent={showRequirements}
                claimedCount={+availability.claimed}
                total={payload.total}
                totalClaimed={minus(payload.total, payload.total_remaining || availability.balance).toFixed()}
                claimedAmount={availability.claimed_amount}
                creator={payload.sender.name}
                showConditionButton={!!claimStrategyStatus?.claimStrategyStatus.length}
                onClickCondition={() => setShowRequirements(true)}
            />
            {cover ?
                <Grow in={showRequirements} timeout={250}>
                    <Conditions
                        statusList={claimStrategyStatus?.claimStrategyStatus ?? EMPTY_LIST}
                        className={classes.conditions}
                        onClose={() => setShowRequirements(false)}
                    />
                </Grow>
            :   null}
        </Card>
    )

    if (outdated) return card

    if (isFireflyRedpacket) {
        return (
            <>
                {card}
                {canClaim ?
                    <Link
                        className={classes.footer}
                        href={`https://firefly.social/post/twitter/${postId}`}
                        target="_blank"
                        rel="noreferrer noopener">
                        <Icons.LinkOut size={18} />
                        <Trans>Claim on Firefly</Trans>
                    </Link>
                :   null}
            </>
        )
    }

    return (
        <>
            {card}
            {/* ChainBoundary needs to know the current network */}
            <NetworkContextProvider initialNetwork={currentPluginID}>
                <OperationFooter
                    className={classes.footer}
                    chainId={redpacketChainId}
                    canClaim={canClaim}
                    canRefund={canRefund}
                    unsatisfied={unsatisfied}
                    isClaimed={isClaimed}
                    isClaiming={isClaiming || checkingClaimStatus}
                    isRefunding={isRefunding}
                    onClaimOrRefund={onClaimOrRefund}
                />
            </NetworkContextProvider>
        </>
    )
})
