import { memo, useMemo, useState } from 'react'
import { useInterval } from 'react-use'
import { isAfter, format, isBefore, intervalToDuration, differenceInDays } from 'date-fns'
import { ActionButton, ShadowRootTooltip, makeStyles } from '@masknet/theme'
import { Box, Typography, alpha } from '@mui/material'
import { useChainContext, useFungibleToken, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { ActivityStatus } from '../../../types.js'
import { NetworkPluginID } from '@masknet/shared-base'
import { ProviderType, type ChainId } from '@masknet/web3-shared-evm'
import { ImageIcon } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { useClaimAirdrop } from '../../../hooks/useClaimAirdrop.js'
import { Trans } from '@lingui/macro'

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
        const { classes } = useStyles()
        const { account, providerType } = useChainContext()
        const [now, setNow] = useState(() => new Date())
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
                        <Trans>
                            Start Time:{' '}
                            <strong className={classes.strong}>{format(startTime, 'MM-dd-yyyy HH:mm')}</strong>
                        </Trans>
                    )
                case ActivityStatus.IN_PROGRESS:
                    const duration = intervalToDuration({
                        start: now,
                        end: endTime,
                    })

                    const days = differenceInDays(endTime, now)

                    return (
                        <Trans>
                            Claiming will be live until:{' '}
                            <strong className={classes.strong}>
                                {' '}
                                {days} d {duration.hours ?? ''} h {duration.minutes ?? ''} m
                            </strong>
                        </Trans>
                    )
                case ActivityStatus.ENDED:
                    return (
                        <Trans>
                            Ended on <strong className={classes.strong}>{format(endTime, 'MM-dd-yyyy HH:mm')}</strong>
                        </Trans>
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
                    <Typography className={classes.title}>
                        <Trans>Mask Community $ARB Giveaway</Trans>
                    </Typography>
                    <Typography className={classes.timeTips}>{timeTips}</Typography>
                    {!account ?
                        <Typography className={classes.tips}>
                            <Trans>Please connect wallet to check if you are eligible to claim $ARB.</Trans>
                        </Typography>
                    :   <>
                            {!isEligible ?
                                <Typography className={classes.tips}>
                                    <Trans>Sorry, you are not eligible to claim $ARB in this campaign.</Trans>
                                </Typography>
                            :   null}
                            {isClaimed ?
                                <Typography className={classes.tips}>
                                    <Trans>You have claimed {amount ?? ''} $ARB.</Trans>
                                </Typography>
                            :   null}
                            {isEligible && !isClaimed ?
                                <Box className={classes.actions}>
                                    <Box>
                                        <Typography className={classes.amount}>
                                            {amount} {tokenDetail.data?.symbol}
                                        </Typography>
                                        <Typography className={classes.claimable}>
                                            {activityStatus === ActivityStatus.IN_PROGRESS ?
                                                <Trans>Eligible to claim</Trans>
                                            :   <Trans>Claimable</Trans>}
                                        </Typography>
                                    </Box>
                                    <ActionButton
                                        onClick={handleClaim}
                                        loading={loading}
                                        className={classes.claimButton}
                                        disabled={activityStatus !== ActivityStatus.IN_PROGRESS}
                                        endIcon={
                                            providerType === ProviderType.WalletConnect ?
                                                <ShadowRootTooltip
                                                    title={
                                                        <Trans>
                                                            You're connected to a WalletConnect wallet. Please switch
                                                            network in that wallet, or switch to another wallet.
                                                        </Trans>
                                                    }
                                                    placement="top">
                                                    <Icons.Questions size={18} />
                                                </ShadowRootTooltip>
                                            :   null
                                        }>
                                        {activityStatus === ActivityStatus.ENDED ?
                                            <Trans>Expired</Trans>
                                        :   <Trans>Claim</Trans>}
                                    </ActionButton>
                                </Box>
                            :   null}
                        </>
                    }
                </Box>
            </Box>
        )
    },
)
