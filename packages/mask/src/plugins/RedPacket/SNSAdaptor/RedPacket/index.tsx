import classNames from 'classnames'
import { useCallback, useMemo } from 'react'
import { Card, Typography } from '@mui/material'
import { ChainId, chainResolver, networkResolver } from '@masknet/web3-shared-evm'
import { useOpenShareTxDialog } from '@masknet/shared'
import { usePostLink } from '../../../../components/DataSource/usePostInfo'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { useI18N as useBaseI18n } from '../../../../utils'
import { useI18N } from '../../locales'
import type { RedPacketJSONPayload } from '../../types'
import { RedPacketStatus } from '../../types'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useRefundCallback } from '../hooks/useRefundCallback'
import { OperationFooter } from './OperationFooter'
import { useStyles } from './useStyles'
import { NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'
import { useAccount, useNetworkType, useWeb3 } from '@masknet/plugin-infra/web3'

export interface RedPacketProps {
    payload: RedPacketJSONPayload
}

export function RedPacket(props: RedPacketProps) {
    const { payload } = props

    const t = useI18N()
    const { t: tr } = useBaseI18n()
    const { classes } = useStyles()

    // context
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const networkType = useNetworkType(NetworkPluginID.PLUGIN_EVM)

    // #region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account ?? payload.contract_address, payload)

    const token = payload.token

    // #endregion

    const { canFetch, canClaim, canRefund, listOfStatus } = availabilityComputed

    // #region remote controlled transaction dialog
    const postLink = usePostLink()

    const [{ loading: isClaiming, value: claimTxHash }, claimCallback] = useClaimCallback(
        payload.contract_version,
        account,
        payload.rpid,
        payload.contract_version > 3 ? web3?.eth.accounts.sign(account, payload.password).signature : payload.password,
    )

    const shareText = useMemo(() => {
        const isOnTwitter = isTwitter(activatedSocialNetworkUI)
        const isOnFacebook = isFacebook(activatedSocialNetworkUI)
        const shareTextOption = {
            sender: payload.sender.name,
            payload: postLink.toString(),
            network: networkResolver.networkName(networkType) ?? 'Mainnet',
            account: isTwitter(activatedSocialNetworkUI) ? tr('twitter_account') : tr('facebook_account'),
        }
        if (listOfStatus.includes(RedPacketStatus.claimed) || claimTxHash) {
            return isOnTwitter || isOnFacebook
                ? t.share_message_official_account(shareTextOption)
                : t.share_message_not_twitter(shareTextOption)
        }

        return isOnTwitter || isOnFacebook
            ? t.share_unclaimed_message_official_account(shareTextOption)
            : t.share_unclaimed_message_not_twitter(shareTextOption)
    }, [payload, postLink, networkType, claimTxHash, listOfStatus, activatedSocialNetworkUI, t, tr])

    const [{ loading: isRefunding }, isRefunded, refundCallback] = useRefundCallback(
        payload.contract_version,
        account,
        payload.rpid,
    )

    const openShareTxDialog = useOpenShareTxDialog()

    const onClaimOrRefund = useCallback(async () => {
        let hash: string | undefined
        if (canClaim) {
            hash = await claimCallback()
        } else if (canRefund) {
            hash = await refundCallback()
        }
        revalidateAvailability()
        if (typeof hash !== 'string' || canRefund) return
        openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })
    }, [canClaim, canRefund, claimCallback, isRefunded, openShareTxDialog])

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
        return t.description_failover({
            total: formatBalance(payload.total, token.decimals, 2),
            symbol: token.symbol ?? '-',
            shares: payload.shares.toString() ?? '-',
        })
    }, [availability, canRefund, token, t, payload, listOfStatus])

    const handleShare = useCallback(() => {
        if (!shareText || !activatedSocialNetworkUI.utils.share) return
        activatedSocialNetworkUI.utils.share(shareText)
    }, [shareText])

    // the red packet can fetch without account
    if (!availability || !token)
        return (
            <Card className={classes.root} component="article" elevation={0}>
                <Typography className={classes.loadingText} variant="body2">
                    {tr('loading')}
                </Typography>
            </Card>
        )

    return (
        <>
            <Card className={classNames(classes.root)} component="article" elevation={0}>
                <div className={classes.header}>
                    {/* it might be fontSize: 12 on twitter based on theme? */}
                    {canFetch && listOfStatus.length ? (
                        <Typography className={classes.label} variant="body2">
                            {resolveRedPacketStatus(listOfStatus)}
                        </Typography>
                    ) : null}
                </div>
                <div className={classNames(classes.content)}>
                    <div className={classes.fullWidthBox}>
                        <Typography className={classes.words} variant="h6">
                            {payload.sender.message}
                        </Typography>
                        <Typography variant="body2">{subtitle}</Typography>
                    </div>
                    <div className={classes.bottomContent}>
                        <Typography className={classes.myStatus} variant="body1">
                            {myStatus}
                        </Typography>
                        <Typography className={classes.from} variant="body1">
                            {t.from({ name: payload.sender.name ?? '-' })}
                        </Typography>
                    </div>
                </div>
            </Card>
            {listOfStatus.includes(RedPacketStatus.empty) ? null : (
                <OperationFooter
                    chainId={payload.token?.chainId ?? chainResolver.chainId(payload.network ?? '') ?? ChainId.Mainnet}
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
