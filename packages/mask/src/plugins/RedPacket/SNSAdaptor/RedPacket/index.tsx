import classNames from 'classnames'
import { useCallback, useEffect, useMemo } from 'react'
import { useRemoteControlledDialog } from '@masknet/shared'
import { Card, Skeleton, Typography } from '@mui/material'
import {
    ChainId,
    formatBalance,
    getChainIdFromName,
    resolveNetworkName,
    TransactionStateType,
    useAccount,
    useFungibleTokenDetailed,
    useNetworkType,
    useWeb3,
    useTokenConstants,
    EthereumTokenType,
    isSameAddress,
} from '@masknet/web3-shared-evm'
import { usePostLink } from '../../../../components/DataSource/usePostInfo'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base'
import { useI18N } from '../../../../utils'
import { EthereumChainBoundary } from '../../../../web3/UI/EthereumChainBoundary'
import { WalletMessages } from '../../../Wallet/messages'
import type { RedPacketAvailability, RedPacketJSONPayload } from '../../types'
import { RedPacketStatus } from '../../types'
import { useAvailabilityComputed } from '../hooks/useAvailabilityComputed'
import { useClaimCallback } from '../hooks/useClaimCallback'
import { useRefundCallback } from '../hooks/useRefundCallback'
import { OperationFooter } from './OperationFooter'
import { useStyles } from './useStyles'

export interface RedPacketProps {
    payload: RedPacketJSONPayload
}

export function RedPacket(props: RedPacketProps) {
    const { payload } = props

    const { t } = useI18N()
    const { classes } = useStyles()
    // context
    const web3 = useWeb3()
    const account = useAccount()
    const networkType = useNetworkType()

    //#region token detailed
    const {
        value: availability,
        computed: availabilityComputed,
        retry: revalidateAvailability,
    } = useAvailabilityComputed(account, payload)

    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const { value: tokenDetailed } = useFungibleTokenDetailed(
        payload.token?.type ?? payload.token_type ?? isSameAddress(NATIVE_TOKEN_ADDRESS, payload.token_address)
            ? EthereumTokenType.Native
            : EthereumTokenType.ERC20,
        payload.token?.address ?? payload.token_address ?? '',
    )
    const token = payload.token ?? tokenDetailed
    //#endregion

    const { canFetch, canClaim, canRefund, listOfStatus } = availabilityComputed

    //#region remote controlled transaction dialog
    const postLink = usePostLink()
    const shareLink = activatedSocialNetworkUI.utils
        .getShareLinkURL?.(
            t(
                isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                    ? 'plugin_red_packet_share_message_official_account'
                    : 'plugin_red_packet_share_message_not_twitter',
                {
                    sender: payload.sender.name,
                    payload: postLink,
                    network: resolveNetworkName(networkType),
                    account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
                },
            ).trim(),
        )
        .toString()

    const [claimState, claimCallback, resetClaimCallback] = useClaimCallback(
        payload.contract_version,
        account,
        payload.rpid,
        payload.contract_version > 3 ? web3.eth.accounts.sign(account, payload.password).signature : payload.password,
    )
    const [refundState, refundCallback, resetRefundCallback] = useRefundCallback(
        payload.contract_version,
        account,
        payload.rpid,
    )

    // close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
    )

    // open the transaction dialog
    useEffect(() => {
        const state = canClaim ? claimState : refundState
        if (state.type === TransactionStateType.UNKNOWN) return
        if (!availability || !token) return
        if (state.type === TransactionStateType.HASH) {
            setTransactionDialog({
                open: true,
                shareLink: shareLink!.toString(),
                state,
                summary: canClaim
                    ? t('plugin_red_packet_claiming_from', { name: payload.sender.name })
                    : canRefund
                    ? t('plugin_red_packet_refunding_for', {
                          balance: formatBalance(availability.balance, token.decimals),
                          symbol: token.symbol,
                      })
                    : '',
            })
        } else if (state.type === TransactionStateType.CONFIRMED) {
            resetClaimCallback()
            resetRefundCallback()
            revalidateAvailability()
        }
    }, [claimState, refundState /* update tx dialog only if state changed */])
    //#endregion

    const onClaimOrRefund = useCallback(async () => {
        if (canClaim) await claimCallback()
        else if (canRefund) await refundCallback()
    }, [canClaim, canRefund, claimCallback, refundCallback])

    const myStatus = useMemo(() => {
        if (token && listOfStatus.includes(RedPacketStatus.claimed))
            return t(
                'plugin_red_packet_description_claimed',
                (availability as RedPacketAvailability).claimed_amount
                    ? {
                          amount: formatBalance(
                              (availability as RedPacketAvailability).claimed_amount,
                              token.decimals,
                              8,
                          ),
                          symbol: token.symbol,
                      }
                    : { amount: '', symbol: '' },
            )
        return ''
    }, [listOfStatus, t, token])

    const subtitle = useMemo(() => {
        if (!availability || !token) return

        if (listOfStatus.includes(RedPacketStatus.expired) && canRefund)
            return t('plugin_red_packet_description_refund', {
                balance: formatBalance(availability.balance, token.decimals),
                symbol: token.symbol,
            })
        if (listOfStatus.includes(RedPacketStatus.refunded)) return t('plugin_red_packet_description_refunded')
        if (listOfStatus.includes(RedPacketStatus.expired)) return t('plugin_red_packet_description_expired')
        if (listOfStatus.includes(RedPacketStatus.empty)) return t('plugin_red_packet_description_empty')
        if (!payload.password) return t('plugin_red_packet_description_broken')
        return t('plugin_red_packet_description_failover', {
            total: formatBalance(payload.total, token.decimals),
            symbol: token.symbol,
            name: payload.sender.name ?? '-',
            shares: payload.shares ?? '-',
        })
    }, [availability, canRefund, token, t, payload, listOfStatus])

    // the red packet can fetch without account
    if (!availability || !token)
        return (
            <EthereumChainBoundary chainId={getChainIdFromName(payload.network ?? '') ?? ChainId.Mainnet}>
                <Card className={classes.root} component="article" elevation={0}>
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="30%"
                        height={12}
                        style={{ marginTop: 16 }}
                    />
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="40%"
                        height={12}
                        style={{ marginTop: 16 }}
                    />
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="70%"
                        height={12}
                        style={{ marginBottom: 16 }}
                    />
                </Card>
            </EthereumChainBoundary>
        )

    return (
        <EthereumChainBoundary chainId={getChainIdFromName(payload.network ?? '') ?? ChainId.Mainnet}>
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
                    <div>
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
                            {t('plugin_red_packet_from', { name: payload.sender.name ?? '-' })}
                        </Typography>
                    </div>
                </div>
            </Card>
            <OperationFooter
                canClaim={canClaim}
                canRefund={canRefund}
                claimState={claimState}
                refundState={refundState}
                shareLink={shareLink}
                onClaimOrRefund={onClaimOrRefund}
            />
        </EthereumChainBoundary>
    )
}

function resolveRedPacketStatus(listOfStatus: RedPacketStatus[]) {
    if (listOfStatus.includes(RedPacketStatus.claimed)) return 'Claimed'
    if (listOfStatus.includes(RedPacketStatus.refunded)) return 'Refunded'
    if (listOfStatus.includes(RedPacketStatus.expired)) return 'Expired'
    if (listOfStatus.includes(RedPacketStatus.empty)) return 'Empty'
    return ''
}
