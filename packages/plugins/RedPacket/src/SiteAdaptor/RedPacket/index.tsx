import { usePostLink, useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { TransactionConfirmModal } from '@masknet/shared'
import { NetworkPluginID, Sniffings } from '@masknet/shared-base'
import { LoadingBase, makeStyles, parseColor } from '@masknet/theme'
import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js'
import { useChainContext, useNetwork, useNetworkContext } from '@masknet/web3-hooks-base'
import { ChainResolver } from '@masknet/web3-providers'
import { RedPacketStatus, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { TokenType, formatBalance, isZero } from '@masknet/web3-shared-base'
import { ChainId, signMessage } from '@masknet/web3-shared-evm'
import { Box, Card, Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useCallback, useMemo } from 'react'
import { useI18N } from '../../locales/index.js'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed.js'
import { useClaimCallback } from '../hooks/useClaimCallback.js'
import { useRedPacketContract } from '../hooks/useRedPacketContract.js'
import { useRefundCallback } from '../hooks/useRefundCallback.js'
import { OperationFooter } from './OperationFooter.js'

export const useStyles = makeStyles<{ outdated: boolean }>()((theme, { outdated }) => {
    return {
        root: {
            borderRadius: theme.spacing(2),
            padding: theme.spacing(1.5, 2),
            position: 'relative',
            display: 'flex',
            backgroundColor: 'transparent',
            color: theme.palette.common.white,
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: 335,
            margin: 'auto',
            marginBottom: outdated ? '12px' : 'auto',
            boxSizing: 'border-box',
            backgroundImage: `url(${new URL('../assets/cover.png', import.meta.url)})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                padding: theme.spacing(1, 1.5),
                height: 202,
            },
            width: 'calc(100% - 32px)',
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
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            color: theme.palette.common.white,
            fontSize: 24,
            fontWeight: 700,
            wordBreak: 'break-all',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            width: '60%',
            minWidth: 300,
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

export function RedPacket(props: RedPacketProps) {
    const { payload } = props
    const token = payload.token

    const t = useI18N()
    const context = useSiteAdaptorContext()
    const { pluginID } = useNetworkContext()
    const payloadChainId = token?.chainId ?? ChainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        chainId: payloadChainId,
        account: pluginID === NetworkPluginID.PLUGIN_EVM ? undefined : '',
    })

    // #region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account ?? payload.contract_address, payload)

    // #endregion

    const { canClaim, canRefund, listOfStatus } = availabilityComputed

    // #region remote controlled transaction dialog
    const postLink = usePostLink()

    const [{ loading: isClaiming, value: claimTxHash }, claimCallback] = useClaimCallback(
        payload.contract_version,
        account,
        payload.rpid,
        payload.contract_version > 3 ? signMessage(account, payload.password).signature : payload.password,
        payloadChainId,
    )

    // TODO payload.chainId is undefined on production mode
    const network = useNetwork(pluginID, payload.chainId || payload.token?.chainId)
    const shareText = useMemo(() => {
        const isOnTwitter = Sniffings.is_twitter_page
        const isOnFacebook = Sniffings.is_facebook_page
        const shareTextOption = {
            sender: payload.sender.name,
            payload: postLink.toString(),
            network: network?.name ?? 'Mainnet',
            account: isOnTwitter ? t.twitter_account() : t.facebook_account(),
            interpolation: { escapeValue: false },
        }
        if (listOfStatus.includes(RedPacketStatus.claimed) || claimTxHash) {
            return isOnTwitter || isOnFacebook
                ? t.share_message_official_account(shareTextOption)
                : t.share_message_not_twitter(shareTextOption)
        }

        return isOnTwitter || isOnFacebook
            ? t.share_unclaimed_message_official_account(shareTextOption)
            : t.share_unclaimed_message_not_twitter(shareTextOption)
    }, [payload, postLink, claimTxHash, listOfStatus, t, network?.name])

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
            shareText,
            amount: formatBalance(data.claimed_amount, token?.decimals, 2),
            token,
            tokenType: TokenType.Fungible,
            messageTextForNFT: t.claim_nft_successful({
                name: 'NFT',
            }),
            messageTextForFT: t.claim_token_successful({
                amount: formatBalance(data.claimed_amount, token?.decimals, 2),
                name: `$${token?.symbol}`,
            }),
            title: t.lucky_drop(),
            share: context?.share,
        })
    }, [JSON.stringify(token), redPacketContract, payload.rpid, account, context?.share])

    const onClaimOrRefund = useCallback(async () => {
        let hash: string | undefined
        if (canClaim) {
            hash = await claimCallback()
            checkResult()
        } else if (canRefund) {
            hash = await refundCallback()
        }
        if (typeof hash === 'string') {
            revalidateAvailability()
        }
    }, [canClaim, canRefund, claimCallback])

    const myStatus = useMemo(() => {
        if (!availability) return ''
        if (token && listOfStatus.includes(RedPacketStatus.claimed))
            return t.description_claimed(
                availability.claimed_amount
                    ? {
                          amount: formatBalance(availability.claimed_amount, token.decimals, 2),
                          symbol: token.symbol,
                      }
                    : { amount: '-', symbol: '-' },
            )
        return ''
    }, [listOfStatus, t, token])

    const subtitle = useMemo(() => {
        if (!availability || !token) return

        if (listOfStatus.includes(RedPacketStatus.expired) && canRefund)
            return t.description_refund({
                balance: formatBalance(availability.balance, token.decimals, 2),
                symbol: token.symbol ?? '-',
            })
        if (listOfStatus.includes(RedPacketStatus.refunded)) return t.description_refunded()
        if (listOfStatus.includes(RedPacketStatus.expired)) return t.description_expired()
        if (listOfStatus.includes(RedPacketStatus.empty)) return t.description_empty()
        if (!payload.password) return t.description_broken()
        const i18nParams = {
            total: formatBalance(payload.total, token.decimals, 2),
            symbol: token.symbol ?? '-',
            count: payload.shares.toString() ?? '-',
        }
        return payload.shares > 1 ? t.description_failover_other(i18nParams) : t.description_failover_one(i18nParams)
    }, [availability, canRefund, token, t, payload, listOfStatus])

    const handleShare = useCallback(() => {
        if (!shareText) return
        context?.share?.(shareText)
    }, [shareText, context?.share])

    const outdated =
        listOfStatus.includes(RedPacketStatus.empty) || (!canRefund && listOfStatus.includes(RedPacketStatus.expired))

    const { classes } = useStyles({ outdated })

    // the red packet can fetch without account
    if (!availability || !token)
        return (
            <Box
                flex={1}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                gap={1}
                padding={1}
                minHeight={148}>
                <LoadingBase />
                <Typography>{t.loading()}</Typography>
            </Box>
        )

    return (
        <>
            <Card className={classes.root} component="article" elevation={0}>
                <img
                    src={new URL('../assets/tokenLabel.png', import.meta.url).toString()}
                    className={classes.tokenLabel}
                />
                <div className={classes.header}>
                    {/* it might be fontSize: 12 on twitter based on theme? */}
                    {listOfStatus.length ? (
                        <Typography className={classes.label} variant="body2">
                            {resolveRedPacketStatus(listOfStatus)}
                        </Typography>
                    ) : null}
                </div>
                <div className={classes.content}>
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
                            {t.from({ name: payload.sender.name || '-' })}
                        </Typography>
                    </div>
                </div>
            </Card>
            {outdated ? null : (
                <OperationFooter
                    chainId={payloadChainId}
                    canClaim={canClaim}
                    canRefund={canRefund}
                    isClaiming={isClaiming}
                    isRefunding={isRefunding}
                    onShare={handleShare}
                    onClaimOrRefund={onClaimOrRefund}
                />
            )}
        </>
    )
}

function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed'
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded'
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired'
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty'
    return ''
}
