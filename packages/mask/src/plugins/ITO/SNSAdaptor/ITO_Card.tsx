import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Alert, Box, Skeleton, Typography } from '@mui/material'
import { useOpenShareTxDialog } from '@masknet/shared'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useCallback, useEffect, useMemo } from 'react'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useMaskClaimCallback } from './hooks/useMaskClaimCallback'
import { useMaskITO_Packet } from './hooks/useMaskITO_Packet'
import { FungibleToken, formatBalance } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    root: {
        borderRadius: 10,
        width: '100%',
        background: 'linear-gradient(90deg, #FE686F 0%, #F78CA0 100%);',
        marginTop: theme.spacing(2.5),
    },
    amount: {
        fontSize: 18,
        zIndex: 1,
        position: 'relative',
    },
    content: {
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        padding: theme.spacing(2.5),
    },
    ITOAlertContainer: {
        padding: theme.spacing(0, 2.5, 2.5, 2.5),
    },
    ITOAlert: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#fff',
    },
    button: {
        // TODO: https://github.com/mui-org/material-ui/issues/25011
        '&[disabled]': {
            opacity: 0.5,
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
    },
}))

export interface ITO_CardProps extends withClasses<never> {
    token?: FungibleToken<ChainId, SchemaType.ERC20>
    onUpdateAmount: (amount: string) => void
    onUpdateBalance: () => void
}

export function ITO_Card(props: ITO_CardProps) {
    const { token, onUpdateAmount, onUpdateBalance } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const { value: packet, loading: packetLoading, error: packetError, retry: packetRetry } = useMaskITO_Packet()

    // #region claim
    const [{ loading: isClaiming }, claimCallback] = useMaskClaimCallback()
    const openShareTxDialog = useOpenShareTxDialog()
    const postLink = usePostLink()
    const shareText = useMemo(() => {
        const isOnTwitter = isTwitter(activatedSocialNetworkUI)
        const isOnFacebook = isFacebook(activatedSocialNetworkUI)
        const cashTag = isOnTwitter ? '$' : ''
        return t('plugin_ito_share_text', {
            symbol: `${cashTag}${token?.symbol}`,
            balance: formatBalance(packet?.claimable, 18, 6),
            account_promote: t('plugin_ito_account_promote', {
                context: isOnTwitter ? 'twitter' : isOnFacebook ? 'facebook' : 'default',
            }),
            link: postLink,
        })
    }, [t, postLink, packet?.claimable, token?.symbol])

    const claim = useCallback(async () => {
        const hash = await claimCallback()
        if (typeof hash !== 'string') return
        await openShareTxDialog({
            hash,
            onShare() {
                activatedSocialNetworkUI.utils.share?.(shareText)
            },
        })

        onUpdateBalance()
        packetRetry()
    }, [shareText, openShareTxDialog, claimCallback])
    // #endregion

    // #region update parent amount
    useEffect(() => {
        if (!packet) return
        onUpdateAmount(packet.claimable)
    }, [packet, onUpdateAmount])
    // #endregion

    if (!token) return null

    if (packetLoading)
        return (
            <Box className={classes.root}>
                <Box className={classes.content} flexDirection="column">
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        height={25}
                        width="80%"
                        style={{ marginBottom: 8 }}
                    />
                    <Skeleton animation="wave" variant="rectangular" height={28} width="40%" />
                </Box>
            </Box>
        )

    if (packetError)
        return (
            <Box className={classes.root} display="flex" justifyContent="center">
                <Box className={classes.content}>
                    <Typography>{packetError.message}</Typography>
                    <ActionButton className={classes.button} onClick={() => packetRetry()}>
                        {t('retry')}
                    </ActionButton>
                </Box>
            </Box>
        )

    return (
        <Box className={classes.root}>
            <Box className={classes.content}>
                <Box display="flex" flexDirection="column" justifyContent="space-between">
                    <Typography>{t('plugin_ito_locked')}</Typography>
                    <Typography className={classes.amount}>
                        {packet && packet.claimable !== '0'
                            ? formatBalance(packet.claimable, token.decimals, 6)
                            : '0.00'}
                    </Typography>
                </Box>
                {packet ? (
                    <Box display="flex" alignItems="center">
                        <ActionButton
                            loading={isClaiming}
                            className={classes.button}
                            disabled={
                                Number.parseInt(packet.unlockTime, 10) > Math.round(Date.now() / 1000) ||
                                packet.claimable === '0' ||
                                isClaiming
                            }
                            onClick={claim}>
                            {t('plugin_ito_claim')}
                        </ActionButton>
                    </Box>
                ) : null}
            </Box>
            {packet ? (
                <Box className={classes.ITOAlertContainer}>
                    <Alert icon={false} className={classes.ITOAlert}>
                        {t('plugin_ito_unlock_time_cert', {
                            date: new Date(Number.parseInt(packet.unlockTime, 10) * 1000).toUTCString(),
                        })}
                    </Alert>
                </Box>
            ) : null}
        </Box>
    )
}
