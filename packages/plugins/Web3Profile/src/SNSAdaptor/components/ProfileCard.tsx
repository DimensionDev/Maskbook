import { Icons } from '@masknet/icons'
import { PlatformAvatar, WalletSettingCard } from '@masknet/shared'
import { type BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Twitter } from '@masknet/web3-providers'
import { Card, CardContent, CardHeader, Collapse, Skeleton, Typography, type CardProps } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { memo, type FC, useState, useCallback, useMemo } from 'react'

const useStyles = makeStyles()((theme) => ({
    card: {
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark' ? '0px 0px 20px rgba(255, 255, 255, 0.12)' : '0 0 20px rgba(0, 0, 0, 0.05)',
    },
    header: {
        cursor: 'pointer',
    },
    content: {
        padding: theme.spacing(0, 2, 2),
        paddingBottom: '16px !important',
    },
    avatar: {
        marginRight: theme.spacing(1),
    },
    headerContent: {
        height: 40,
    },
    action: {
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'center',
    },
    wallets: {
        borderTop: `1px solid ${theme.palette.maskColor.line}`,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(1.5),
    },
    percent: {
        width: 36,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
    arrowWrapper: {
        width: 38,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        height: 18,
        lineHeight: '18px',
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.palette.maskColor.main,
    },
    subheader: {
        height: 16,
        lineHeight: '16px',
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(0.5),
    },
}))

interface Props extends CardProps {
    profile: BindingProof
    avatar?: string
    walletProofs?: BindingProof[]
    unlistedAddresses: string[]
    pendingUnlistedAddresses: string[]
    initialCollapsed?: boolean
    onToggle?(identity: string, address: string): void
}

export const ProfileCard: FC<Props> = memo(function ProfileCard({
    profile,
    avatar,
    walletProofs = EMPTY_LIST,
    className,
    unlistedAddresses,
    pendingUnlistedAddresses,
    initialCollapsed = true,
    onToggle,
    ...rest
}) {
    const { classes, cx } = useStyles()
    const [collapsed, setCollapsed] = useState(initialCollapsed)
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', profile.identity],
        queryFn: () => Twitter.getUserByScreenName(profile.identity),
    })
    const nickname = user?.legacy?.name || profile.name || profile.identity
    const handleSwitch = useCallback(
        (address: string) => {
            onToggle?.(profile.identity, address)
        },
        [onToggle, profile.identity],
    )
    const listingAddresses = useMemo(() => {
        const addresses = walletProofs.map((x) => x.identity)
        return addresses.filter((x) => !pendingUnlistedAddresses.includes(x))
    }, [pendingUnlistedAddresses])
    return (
        <Card className={cx(classes.card, className)} {...rest}>
            <CardHeader
                className={classes.header}
                classes={{
                    avatar: classes.avatar,
                    action: classes.action,
                    content: classes.headerContent,
                }}
                avatar={
                    <PlatformAvatar
                        networkIcon={avatar}
                        providerIcon={new URL('../assets/Twitter.png', import.meta.url).href}
                        size={36}
                    />
                }
                title={
                    <Typography variant="subtitle1" className={classes.title}>
                        {nickname}
                    </Typography>
                }
                subheader={
                    <Typography variant="subtitle2" className={classes.subheader}>
                        @{profile.identity}
                    </Typography>
                }
                action={
                    <>
                        <Icons.ConnectWallet size={24} />
                        <Typography className={classes.percent} variant="body2" mx={1}>
                            {listingAddresses.length}/{walletProofs.length}
                        </Typography>
                        <div className={classes.arrowWrapper}>
                            {collapsed ? <Icons.ArrowDrop size={20} /> : <Icons.ArrowUp size={20} />}
                        </div>
                    </>
                }
                onClick={() => setCollapsed((v) => !v)}
            />
            <Collapse in={!collapsed} easing="ease-in-out">
                <CardContent className={classes.content}>
                    <div className={classes.wallets}>
                        {walletProofs.map((proof) => {
                            const checked = listingAddresses.includes(proof.identity)
                            return (
                                <WalletSettingCard
                                    key={proof.identity}
                                    wallet={proof}
                                    checked={checked}
                                    onSwitchChange={handleSwitch}
                                />
                            )
                        })}
                    </div>
                </CardContent>
            </Collapse>
        </Card>
    )
})

export const ProfileCardSkeleton = memo(function ProfileCardSkeleton(props: CardProps) {
    const { classes, cx } = useStyles()
    return (
        <Card {...props} className={cx(classes.card, props.className)}>
            <CardHeader
                className={classes.header}
                classes={{
                    avatar: classes.avatar,
                    action: classes.action,
                    content: classes.headerContent,
                }}
                avatar={<Skeleton variant="circular" height={36} width={36} />}
                title={<Skeleton variant="text" height={18} width={60} />}
                subheader={<Skeleton variant="text" height={16} width={40} />}
            />
        </Card>
    )
})
