import { memo, useMemo, useState } from 'react'
import { Translate, useI18N } from '../../../locales/i18n_generated.js'
import { ActionButton, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Box, Typography, alpha } from '@mui/material'
import { useChainContext, useFungibleToken, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import isAfter from 'date-fns/isAfter'
import format from 'date-fns/format'
import isBefore from 'date-fns/isBefore'
import intervalToDuration from 'date-fns/intervalToDuration'
import differenceInDays from 'date-fns/differenceInDays'
import { ActivityStatus } from '../../../types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { ProviderType, type ChainId } from '@masknet/web3-shared-evm'
import { ImageIcon } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { useClaimAirdrop } from '../../../hooks/useClaimAirdrop.js'
import { useInterval } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
    },
    container: {
        position: 'relative',
        height: 200,
        borderRadius: 12,
        backgroundImage: `url(${new URL('../../../assets/ARB-background.png', import.meta.url)})`,
        backgroundRepeat: 'no-repeat',
        paddingLeft: 232,
        paddingRight: 20,
        backgroundSize: 'contain',
    },
    content: {
        marginTop: 46,
    },
    title: {
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 1.2,
        color: theme.palette.maskColor.white,
    },
    timeTips: {
        fontSize: 14,
        lineHeight: '18px',
        marginTop: theme.spacing(1),
        color: alpha(theme.palette.maskColor.white, 0.8),
    },
    tips: {
        marginTop: theme.spacing(1),
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.white,
    },
    actions: {
        marginTop: theme.spacing(1),
        display: 'flex',
        justifyContent: 'space-between',
    },
    amount: {
        color: theme.palette.maskColor.white,
        fontSize: 20,
        lineHeight: '24px',
        fontWeight: 700,
    },
    claimable: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.white,
    },
    claimButton: {
        background: theme.palette.maskColor.white,
        color: theme.palette.maskColor.publicMain,
        '&:hover': {
            background: theme.palette.maskColor.white,
        },
    },
    strong: {
        color: theme.palette.maskColor.white,
        fontWeight: 700,
    },
}))

interface AirDropActivityItemProps {
    startTime: number
    endTime: number
    token: string
    isClaimed?: boolean
    amount?: string
    isEligible?: boolean
    chainId: ChainId
    merkleProof?: string[]
    eventIndex: number
    onClaimSuccess: () => void
}

export const AirDropActivityItem = memo<AirDropActivityItemProps>(
    ({
        startTime,
        endTime,
        token,
        isClaimed,
        amount,
        isEligible,
        chainId,
        merkleProof,
        eventIndex,
        onClaimSuccess,
    }) => {
        const t = useI18N()
        const { classes } = useStyles()
        const { account, providerType } = useChainContext()
        const [now, setNow] = useState(new Date())
        const networkDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, chainId)

        const activityStatus = useMemo(() => {
            if (!isAfter(now, startTime)) return ActivityStatus.NOT_START
            if (isBefore(endTime, now)) return ActivityStatus.ENDED
            return ActivityStatus.IN_PROGRESS
        }, [startTime, endTime, now])

        const timeTips = useMemo(() => {
            switch (activityStatus) {
                case ActivityStatus.NOT_START:
                    return (
                        <Translate.start_time_tips
                            values={{ time: format(startTime, 'MM-dd-yyyy HH:mm') }}
                            components={{ strong: <strong className={classes.strong} /> }}
                        />
                    )
                case ActivityStatus.IN_PROGRESS:
                    const duration = intervalToDuration({
                        start: now,
                        end: endTime,
                    })

                    const days = differenceInDays(endTime, now)

                    return (
                        <Translate.airdrop_in_progress_time_tips
                            values={{
                                days: String(days ?? ''),
                                hours: String(duration.hours ?? ''),
                                minutes: String(duration.minutes ?? ''),
                            }}
                            components={{ strong: <strong className={classes.strong} /> }}
                        />
                    )
                case ActivityStatus.ENDED:
                    return (
                        <Translate.start_time_tips
                            values={{ time: format(endTime, 'MM-dd-yyyy HH:mm') }}
                            components={{ strong: <strong className={classes.strong} /> }}
                        />
                    )
            }
        }, [activityStatus, classes, now])

        const tokenDetail = useFungibleToken(NetworkPluginID.PLUGIN_EVM, token, undefined, { chainId })

        const [{ loading }, handleClaim] = useClaimAirdrop(
            chainId,
            eventIndex,
            onClaimSuccess,
            merkleProof,
            amount,
            token,
        )

        // Time update every minute
        useInterval(() => {
            setNow(new Date())
        }, 1000 * 60)

        return (
            <Box className={classes.container}>
                <ImageIcon icon={networkDescriptor?.icon} size={24} className={classes.badge} />
                <Box className={classes.content}>
                    <Typography className={classes.title}>{t.airdrop_title({ symbol: 'ARB' })}</Typography>
                    <Typography className={classes.timeTips}>{timeTips}</Typography>
                    {!account ? (
                        <Typography className={classes.tips}>{t.no_account_tips({ symbol: 'ARB' })}</Typography>
                    ) : (
                        <>
                            {!isEligible ? (
                                <Typography className={classes.tips}>{t.no_eligible_tips()}</Typography>
                            ) : null}
                            {isClaimed ? (
                                <Typography className={classes.tips}>
                                    {t.claimed_tips({ amount: amount ?? '', symbol: 'ARB' })}
                                </Typography>
                            ) : null}
                            {isEligible && !isClaimed ? (
                                <Box className={classes.actions}>
                                    <Box>
                                        <Typography className={classes.amount}>
                                            {amount} {tokenDetail.data?.symbol}
                                        </Typography>
                                        <Typography className={classes.claimable}>
                                            {activityStatus === ActivityStatus.IN_PROGRESS
                                                ? t.eligible_to_claim()
                                                : t.claimable()}
                                        </Typography>
                                    </Box>
                                    <ActionButton
                                        onClick={handleClaim}
                                        loading={loading}
                                        className={classes.claimButton}
                                        disabled={activityStatus !== ActivityStatus.IN_PROGRESS}
                                        endIcon={
                                            providerType === ProviderType.WalletConnect ? (
                                                <ShadowRootTooltip title={t.wallet_connect_tips()} placement="top">
                                                    <Icons.Questions size={18} />
                                                </ShadowRootTooltip>
                                            ) : null
                                        }>
                                        {activityStatus === ActivityStatus.ENDED ? t.expired() : t.claim()}
                                    </ActionButton>
                                </Box>
                            ) : null}
                        </>
                    )}
                </Box>
            </Box>
        )
    },
)
