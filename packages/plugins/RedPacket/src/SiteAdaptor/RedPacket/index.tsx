/* eslint-disable no-irregular-whitespace */
import { useLastRecognizedIdentity, usePostInfoDetails, usePostLink } from '@masknet/plugin-infra/content-script'
import { requestLogin, share } from '@masknet/plugin-infra/content-script/context'
import { LoadingStatus, TransactionConfirmModal } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite, NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { makeStyles, parseColor } from '@masknet/theme'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext, useNetwork, useNetworkContext } from '@masknet/web3-hooks-base'
import { EVMChainResolver, FireflyRedPacket } from '@masknet/web3-providers'
import { RedPacketStatus, type FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { TokenType, formatBalance, isZero } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Card, Grow, Stack, Typography } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { Requirements } from '../Requirements.js'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed.js'
import { useClaimCallback } from '../hooks/useClaimCallback.js'
import { useRedPacketContract } from '../hooks/useRedPacketContract.js'
import { useRefundCallback } from '../hooks/useRefundCallback.js'
import { OperationFooter } from './OperationFooter.js'
import { RequestLoginFooter } from './RequestLoginFooter.js'
import { useRedPacketCover } from './useRedPacketCover.js'
import { Plural, Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles<{ outdated: boolean }>()((theme, { outdated }) => {
    return {
        root: {
            borderRadius: theme.spacing(2),
            padding: theme.spacing(1.5, 2),
            position: 'relative',
            display: 'flex',
            backgroundColor: 'transparent',
            backgroundRepeat: 'no-repeat',
            color: theme.palette.common.white,
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginBottom: outdated ? '12px' : 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
            boxSizing: 'border-box',
            width: 'calc(100% - 32px)',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: theme.spacing(1, 1.5),
                width: 'calc(100% - 20px)',
            },
        },
        fireflyRoot: {
            aspectRatio: '10 / 7',
        },
        maskRoot: {
            marginTop: 'auto',
            height: 335,
            backgroundImage: `url(${new URL('../assets/cover.png', import.meta.url)})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
        },
        cover: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            inset: 0,
            margin: 'auto',
            zIndex: 0,
        },
        requirements: {
            width: 407,
            height: 'fit-content',
            boxSizing: 'border-box',
            position: 'absolute',
            zIndex: 9,
            inset: 0,
            margin: 'auto',
            [`@media (max-width: ${theme.breakpoints.values.md}px)`]: {
                width: 'auto',
            },
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },

        content: {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        bottomContent: {
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
        },
        myStatus: {
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.8,
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
                left: 12,
                bottom: 8,
            },
        },
        from: {
            fontSize: '14px',
            color: theme.palette.common.white,
            alignSelf: 'end',
            fontWeight: 500,
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
                right: 12,
                bottom: 8,
            },
        },
        label: {
            width: 76,
            height: 27,
            display: 'flex',
            justifyContent: 'center',
            fontSize: 12,
            alignItems: 'center',
            borderRadius: theme.spacing(1),
            backgroundColor: parseColor(theme.palette.common.black).setAlpha(0.5).toString(),
            textTransform: 'capitalize',
            position: 'absolute',
            right: 12,
            top: 12,
        },
        words: {
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            color: theme.palette.common.white,
            fontSize: 24,
            fontWeight: 700,
            wordBreak: 'break-all',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                fontSize: 14,
            },
        },
        messageBox: {
            width: '100%',
        },
        tokenLabel: {
            width: 48,
            height: 48,
            position: 'absolute',
            top: 0,
            left: 0,
        },
    }
})

export interface RedPacketProps {
    payload: RedPacketJSONPayload
}

export const RedPacket = memo(function RedPacket({ payload }: RedPacketProps) {
    const { _ } = useLingui()
    const token = payload.token
    const { pluginID } = useNetworkContext()
    const payloadChainId = token?.chainId ?? EVMChainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payloadChainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })

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

    const { canClaim, canRefund, listOfStatus } = availabilityComputed

    // #region remote controlled transaction dialog
    const postLink = usePostLink()

    const [{ loading: isClaiming, value: claimTxHash }, claimCallback] = useClaimCallback(account, payload)
    const site = usePostInfoDetails.site()
    const source = usePostInfoDetails.source()
    const platform = source?.toLowerCase() as 'lens' | 'farcaster'
    const isOnFirefly = site === EnhanceableSite.Firefly
    const postUrl = usePostInfoDetails.url()
    const handle = usePostInfoDetails.handle()
    const link = postLink.toString() || postUrl?.toString()

    // TODO payload.chainId is undefined on production mode
    const network = useNetwork(pluginID, payload.chainId || payload.token?.chainId)

    const getShareText = useCallback(
        (hasClaimed: boolean) => {
            const sender = handle ?? ''
            const promote_short = _(msg`🧧🧧🧧 Try sending Lucky Drop to your friends with Mask.io.`)
            const farcaster_lens_claimed = _(
                msg`🤑 Just claimed a #LuckyDrop  🧧💰✨ on https://firefly.mask.social from @${sender} !\n\nClaim on Lens: ${link}`,
            )
            const notClaimed = _(
                msg`🤑 Check this Lucky Drop  🧧💰✨ sent by @${sender}.\n\nGrow your followers and engagement with Lucky Drop on Firefly mobile app or https://firefly.mask.social !\n`,
            )
            if (isOnFirefly) {
                if (platform === 'farcaster') {
                    if (hasClaimed) {
                        return farcaster_lens_claimed
                    } else return _(msg`${notClaimed}\nClaim on Farcaster: ${link}`)
                } else if (platform === 'lens') {
                    if (hasClaimed) {
                        return farcaster_lens_claimed
                    } else return _(msg`${notClaimed}\nClaim on Lens: ${link}`)
                } else return _(msg`${notClaimed}\nClaim on: ${link}`)
            }
            const isOnTwitter = Sniffings.is_twitter_page
            const isOnFacebook = Sniffings.is_facebook_page
            const shareTextOption = {
                sender: payload.sender.name,
                payload: link!,
                network: network?.name ?? 'Mainnet',
                account: isOnTwitter ? 'realMaskNetwork' : 'masknetwork',
                interpolation: { escapeValue: false },
            }
            if (hasClaimed) {
                const claimed = _(
                    msg`I just claimed a lucky drop from @${shareTextOption.sender} on ${shareTextOption.network} network.`,
                )
                return isOnTwitter || isOnFacebook ?
                        _(
                            msg`${claimed} Follow @${shareTextOption.account} (mask.io) to claim lucky drops.\n${promote_short}\n#mask_io #LuckyDrop\n${shareTextOption.payload}`,
                        )
                    :   _(msg`${claimed}\n${promote_short}\n${shareTextOption.payload}`)
            }
            const head = _(
                msg`Hi friends, I just found a lucky drop sent by @${shareTextOption.sender} on ${shareTextOption.network} network.`,
            )

            return isOnTwitter || isOnFacebook ?
                    _(
                        msg`${head} Follow @${shareTextOption.account} (mask.io) to claim lucky drops.\n${promote_short}\n#mask_io #LuckyDrop\n${shareTextOption.payload}`,
                    )
                :   `${head}\n${promote_short}\n${shareTextOption.payload}`
        },
        [payload, link, claimTxHash, network?.name, platform, isOnFirefly, handle, _],
    )
    const claimedShareText = useMemo(() => getShareText(true), [getShareText])
    const shareText = useMemo(() => {
        const hasClaimed = listOfStatus.includes(RedPacketStatus.claimed) || claimTxHash
        return getShareText(!!hasClaimed)
    }, [getShareText, listOfStatus, claimTxHash])

    const [{ loading: isRefunding }, _isRefunded, refundCallback] = useRefundCallback(
        payload.contract_version,
        account,
        payload.rpid,
        payloadChainId,
    )

    const redPacketContract = useRedPacketContract(payloadChainId, payload.contract_version) as HappyRedPacketV4
    const checkResult = useCallback(async () => {
        const data = await redPacketContract.methods.check_availability(payload.rpid).call({
            // check availability is ok w/o account
            from: account,
        })
        if (isZero(data.claimed_amount)) return
        TransactionConfirmModal.open({
            shareText: claimedShareText,
            amount: formatBalance(data.claimed_amount, token?.decimals, { significant: 2 }),
            token,
            tokenType: TokenType.Fungible,
            messageTextForNFT: _(msg`1 NFT claimed.`),
            messageTextForFT: _(
                msg`You claimed ${formatBalance(data.claimed_amount, token?.decimals, { significant: 2 })} $${token?.symbol}.`,
            ),
            title: _(msg`Lucky Drop`),
            share: (text) => share?.(text, source ? source : undefined),
        })
    }, [token, redPacketContract, payload.rpid, account, claimedShareText, source])

    const [showRequirements, setShowRequirements] = useState(false)
    const me = useLastRecognizedIdentity()
    const myProfileId = me?.profileId
    const myHandle = me?.identifier?.userId
    const onClaimOrRefund = useCallback(async () => {
        let hash: string | undefined
        if (canClaim) {
            const result = await recheckClaimStatus()
            if (result === false) {
                setShowRequirements(true)
                return
            }
            hash = await claimCallback()
            if (platform && myProfileId && myHandle && hash) {
                await FireflyRedPacket.finishClaiming(
                    payload.rpid,
                    platform as FireflyRedPacketAPI.PlatformType,
                    myProfileId,
                    myHandle,
                    hash,
                )
            }
            checkResult()
        } else if (canRefund) {
            hash = await refundCallback()
        }
        if (typeof hash === 'string') {
            checkAvailability()
        }
    }, [
        canClaim,
        canRefund,
        platform,
        claimCallback,
        checkResult,
        recheckClaimStatus,
        checkAvailability,
        payload.rpid,
        myProfileId,
        myHandle,
    ])

    const myStatus = useMemo(() => {
        if (!availability) return ''
        if (token && listOfStatus.includes(RedPacketStatus.claimed))
            return (
                <Trans>
                    You got{' '}
                    {availability.claimed_amount ?
                        formatBalance(availability.claimed_amount, token.decimals, { significant: 2 })
                    :   '-'}{' '}
                    {availability.claimed_amount ? token.symbol : '-'}
                </Trans>
            )
        return ''
    }, [listOfStatus, token, availability?.claimed_amount])

    const subtitle = useMemo(() => {
        if (!availability || !token) return

        if (listOfStatus.includes(RedPacketStatus.expired) && canRefund)
            return (
                <Trans>
                    You could refund {formatBalance(availability.balance, token.decimals, { significant: 2 })}{' '}
                    {token.symbol ?? '-'}.
                </Trans>
            )
        if (listOfStatus.includes(RedPacketStatus.refunded)) return <Trans>The Lucky Drop has been refunded.</Trans>
        if (listOfStatus.includes(RedPacketStatus.expired)) return <Trans>The Lucky Drop is expired.</Trans>
        if (listOfStatus.includes(RedPacketStatus.empty)) return <Trans>The Lucky Drop is empty.</Trans>
        if (!payload.password) return <Trans>The Lucky Drop is broken.</Trans>
        const total = formatBalance(payload.total, token.decimals, { significant: 2 })
        const symbol = token.symbol ?? '-'
        return (
            <Trans>
                {payload.shares} <Plural value={payload.shares} one="share" other="shares" /> / {total} ${symbol}
            </Trans>
        )
    }, [availability, canRefund, token, payload, listOfStatus, _])

    const handleShare = useCallback(() => {
        if (shareText) share?.(shareText, source ? source : undefined)
    }, [shareText, source])

    const isEmpty = listOfStatus.includes(RedPacketStatus.empty)
    const outdated = isEmpty || (!canRefund && listOfStatus.includes(RedPacketStatus.expired))

    const { classes, cx } = useStyles({ outdated })

    // RedPacket created from Mask has no cover settings
    const cover = useRedPacketCover(payload, availability)

    // the red packet can fetch without account
    if (!availability || !token) return <LoadingStatus minHeight={148} />

    const claimedOrEmpty = listOfStatus.includes(RedPacketStatus.claimed) || isEmpty

    return (
        <>
            <Card
                className={cx(classes.root, cover ? classes.fireflyRoot : classes.maskRoot)}
                component="article"
                elevation={0}
                style={
                    cover ?
                        {
                            backgroundSize: 'contain',
                            backgroundImage: `url(${cover.backgroundImageUrl})`,
                            backgroundColor: cover.backgroundColor,
                        }
                    :   undefined
                }>
                {cover ?
                    <img className={classes.cover} src={cover.url!} />
                :   null}
                <img
                    aria-label="Token"
                    src={new URL('../assets/tokenLabel.png', import.meta.url).toString()}
                    className={classes.tokenLabel}
                />
                <div className={classes.header}>
                    {/* it might be fontSize: 12 on twitter based on theme? */}
                    {listOfStatus.length ?
                        <Typography
                            className={classes.label}
                            variant="body2"
                            style={{ cursor: claimedOrEmpty ? 'pointer' : undefined }}
                            onClick={() => {
                                if (claimedOrEmpty) setShowRequirements((v) => !v)
                            }}>
                            {resolveRedPacketStatus(listOfStatus)}
                        </Typography>
                    :   null}
                </div>
                {cover ?
                    <Grow in={showRequirements ? !checkingClaimStatus : false} timeout={250}>
                        <Requirements
                            showResults={!claimedOrEmpty}
                            statusList={claimStrategyStatus?.claimStrategyStatus ?? EMPTY_LIST}
                            className={classes.requirements}
                            onClose={() => setShowRequirements(false)}
                        />
                    </Grow>
                :   <div className={classes.content}>
                        <Stack />
                        <div className={classes.messageBox}>
                            <Typography className={classes.words} variant="h6">
                                {payload.sender.message}
                            </Typography>
                        </div>
                        <div className={classes.bottomContent}>
                            <div>
                                <Typography variant="body2" className={classes.myStatus}>
                                    {subtitle}
                                </Typography>
                                <Typography className={classes.myStatus} variant="body1">
                                    {myStatus}
                                </Typography>
                            </div>
                            <Typography className={classes.from} variant="body1">
                                <Trans>From: @{payload.sender.name || '-'}</Trans>
                            </Typography>
                        </div>
                    </div>
                }
            </Card>
            {outdated ?
                null
            : myHandle ?
                <OperationFooter
                    chainId={payloadChainId}
                    canClaim={canClaim}
                    canRefund={canRefund}
                    isClaiming={isClaiming || checkingClaimStatus}
                    isRefunding={isRefunding}
                    onShare={handleShare}
                    onClaimOrRefund={onClaimOrRefund}
                />
            :   <RequestLoginFooter
                    onRequest={() => {
                        requestLogin?.(source)
                    }}
                />
            }
        </>
    )
})

function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed'
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded'
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired'
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty'
    return ''
}
