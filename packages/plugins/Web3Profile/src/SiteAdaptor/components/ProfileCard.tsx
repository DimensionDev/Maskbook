import { memo, useState, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Icons } from '@masknet/icons'
import { PlatformAvatar, WalletSettingsCard } from '@masknet/shared'
import { type BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { FireflyTwitter } from '@masknet/web3-providers'
import {
    Card,
    CardContent,
    CardHeader,
    Collapse,
    Skeleton,
    Typography,
    type CardProps,
    Button,
    alpha,
} from '@mui/material'
import { resolveNextIDPlatformWalletName } from '@masknet/web3-shared-base'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    card: {
        backgroundColor: theme.palette.maskColor.bottom,
        border: `1px solid ${theme.palette.maskColor.line}`,
    },
    cursor: {
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
    titleWrapper: {
        display: 'flex',
    },
    title: {
        height: 18,
        lineHeight: '18px',
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.palette.maskColor.main,
    },
    current: {
        display: 'inline-block',
        marginLeft: theme.spacing(1.5),
        borderRadius: 4,
        fontWeight: 'bold',
        fontSize: '10px',
        height: theme.spacing(2),
        lineHeight: '16px',
        padding: '0 6px',
        boxSizing: 'border-box',
        color: theme.palette.maskColor.primary,
        backgroundColor: alpha(theme.palette.maskColor.primary, 0.1),
    },
    subheader: {
        height: 16,
        lineHeight: '16px',
        fontSize: 12,
        fontWeight: 'normal',
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(0.5),
    },
    providerIcon: {
        padding: 1,
        background: theme.palette.maskColor.white,
    },
}))

interface Props extends CardProps {
    profile: BindingProof
    avatar?: string
    walletProofs?: BindingProof[]
    unlistedAddresses: string[]
    pendingUnlistedAddresses: string[]
    initialExpanded?: boolean
    isCurrent?: boolean
    onToggle?(identity: string, address: string): void
    onAddWallet?(): void
}

export const ProfileCard = memo(function ProfileCard({
    profile,
    avatar,
    walletProofs = EMPTY_LIST,
    className,
    unlistedAddresses,
    pendingUnlistedAddresses,
    initialExpanded = false,
    isCurrent,
    onToggle,
    onAddWallet,
    ...rest
}: Props) {
    const { classes, cx } = useStyles()
    const [expanded, setExpanded] = useState(initialExpanded)
    const identity = profile.identity
    const { data: user } = useQuery({
        queryKey: ['twitter', 'profile', identity],
        staleTime: 3600_000,
        refetchOnWindowFocus: false,
        queryFn: () => FireflyTwitter.getUserInfo(identity),
    })
    const nickname = user?.legacy.name || profile.name || profile.identity
    // Identities of Twitter proof get lowered case. Prefer handle from Twitter API.
    const handle = user?.legacy.screen_name || profile.identity
    const avatarUrl = user?.legacy.profile_image_url_https || avatar
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

    const action =
        walletProofs.length ?
            <>
                <Icons.Wallet size={24} />
                <Typography className={classes.percent} variant="body2" mx={1}>
                    {listingAddresses.length}/{walletProofs.length}
                </Typography>
                <div className={classes.arrowWrapper}>
                    {expanded ?
                        <Icons.ArrowUp size={20} />
                    :   <Icons.ArrowDrop size={20} />}
                </div>
            </>
        :   <Button variant="text" disableRipple onClick={onAddWallet} sx={{ px: 1 }}>
                <Trans>Add Wallet</Trans>
            </Button>
    const cardRef = useRef<HTMLDivElement>(null)

    return (
        <Card className={cx(classes.card, className)} ref={cardRef} {...rest}>
            <CardHeader
                className={walletProofs.length ? classes.cursor : undefined}
                classes={{
                    avatar: classes.avatar,
                    action: classes.action,
                    content: classes.headerContent,
                }}
                avatar={
                    <PlatformAvatar
                        classes={{ providerIcon: classes.providerIcon }}
                        networkIcon={avatarUrl}
                        providerIcon={new URL('../assets/TwitterXRound.svg', import.meta.url).href}
                        size={36}
                    />
                }
                title={
                    <div className={classes.titleWrapper}>
                        <Typography variant="subtitle1" className={classes.title}>
                            {nickname}
                        </Typography>
                        {isCurrent ?
                            <span className={classes.current} role="status">
                                <Trans>Current</Trans>
                            </span>
                        :   null}
                    </div>
                }
                subheader={
                    <Typography variant="subtitle2" className={classes.subheader}>
                        @{handle}
                    </Typography>
                }
                action={action}
                onClick={() => {
                    if (!walletProofs.length) return
                    return setExpanded((v) => !v)
                }}
            />
            {walletProofs.length ?
                <Collapse
                    in={expanded}
                    easing="ease-in-out"
                    onEntered={() => {
                        cardRef.current?.scrollIntoView({
                            block: 'nearest',
                            behavior: 'smooth',
                        })
                    }}>
                    <CardContent className={classes.content}>
                        <div className={classes.wallets}>
                            {walletProofs.map((proof, i) => {
                                const checked = listingAddresses.includes(proof.identity)
                                const fallbackName = resolveNextIDPlatformWalletName(proof.platform)
                                return (
                                    <WalletSettingsCard
                                        key={proof.identity}
                                        wallet={proof}
                                        fallbackName={`${fallbackName} ${walletProofs.length - i}`}
                                        checked={checked}
                                        onSwitchChange={handleSwitch}
                                    />
                                )
                            })}
                        </div>
                    </CardContent>
                </Collapse>
            :   null}
        </Card>
    )
})

export const ProfileCardSkeleton = memo(function ProfileCardSkeleton(props: CardProps) {
    const { classes, cx } = useStyles()
    return (
        <Card {...props} className={cx(classes.card, props.className)}>
            <CardHeader
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
