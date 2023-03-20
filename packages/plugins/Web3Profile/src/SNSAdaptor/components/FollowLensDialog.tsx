import { Icons } from '@masknet/icons'
import { InjectedDialog, WalletConnectedBoundary } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { ChainId } from '@masknet/web3-shared-evm'
import { Avatar, Box, Button, CircularProgress, DialogContent, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { useAsyncRetry, useHover } from 'react-use'
import { Translate, useI18N } from '../../locales/i18n_generated.js'
import { getLensterLink } from '../../utils.js'
import { useFollow } from '../hooks/Lens/useFollow.js'
import { useUnfollow } from '../hooks/Lens/useUnfollow.js'
import { HandlerDescription } from './HandlerDescription.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
        marginTop: 24,
    },
    handle: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 400,
        color: theme.palette.maskColor.main,
        margin: theme.spacing(0.5, 0),
    },
    followers: {
        display: 'flex',
        justifyContent: 'center',
        columnGap: 8,
    },
    dialogTitle: {
        background: `${theme.palette.maskColor.bottom}!important`,
    },
    dialogContent: {
        maxWidth: 400,
        minHeight: 398,
    },
    actions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        columnGap: 12,
        width: '100%',
        marginTop: 24,
    },
    followAction: {
        backgroundColor: '#A1FE27',
        color: theme.palette.maskColor.publicMain,
        '&:hover': {
            backgroundColor: '#A1FE27',
            color: theme.palette.maskColor.publicMain,
        },
    },
    profile: {
        marginTop: 24,
        width: '100%',
    },
    tips: {
        marginBottom: theme.spacing(3),
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
}))

export function FollowLensDialog() {
    const t = useI18N()

    const [handle, setHandle] = useState('')
    const { classes } = useStyles()
    const wallet = useWallet()
    const { account, chainId } = useChainContext()

    const { open, closeDialog } = useRemoteControlledDialog(
        CrossIsolationMessages.events.followLensDialogEvent,
        (ev) => {
            if (!ev.open) {
                setHandle('')
            }

            setHandle(ev.handle)
        },
    )

    const { value, loading, retry } = useAsyncRetry(async () => {
        if (!handle || !open || !open) return
        const profile = await Lens.getProfileByHandle(handle)

        if (!profile) return
        const isFollowing = await Lens.queryFollowStatus(account, profile.id)

        return {
            profile,
            isFollowing,
        }
    }, [handle, open, account])

    const { isFollowing, profile } = value ?? {}

    const [{ loading: followLoading }, handleFollow] = useFollow(profile?.id, retry)
    const [{ loading: unfollowLoading }, handleUnfollow] = useUnfollow(profile?.id, retry)

    const [element] = useHover((isHovering) => {
        return (
            <ActionButton
                variant="roundedContained"
                className={classes.followAction}
                disabled={!!wallet?.owner || chainId !== ChainId.Matic || followLoading || unfollowLoading}
                loading={followLoading || unfollowLoading}
                onClick={isFollowing ? handleUnfollow : handleFollow}>
                {isFollowing ? (isHovering ? t.unfollow() : t.following_action()) : t.follow()}
            </ActionButton>
        )
    })

    const tips = useMemo(() => {
        if (wallet?.owner) return t.follow_wallet_tips()
        else if (chainId !== ChainId.Matic) return t.follow_chain_tips()

        return t.follow_gas_tips()
    }, [wallet?.owner, chainId])

    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t.lens()}
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogContent }}>
            <DialogContent sx={{ padding: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={342}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box className={classes.container}>
                        <Avatar src={profile?.picture.original.url} sx={{ width: 64, height: 64 }} />
                        <Typography className={classes.name}>{profile?.name}</Typography>
                        <Typography className={classes.handle}>@{profile?.handle}</Typography>
                        <Typography className={classes.followers}>
                            <Translate.followers
                                components={{ strong: <strong /> }}
                                values={{ followers: String(profile?.stats?.totalFollowers ?? '0') }}
                            />
                            <Translate.following
                                components={{ strong: <strong /> }}
                                values={{ following: String(profile?.stats?.totalFollowing ?? '0') }}
                            />
                        </Typography>
                        <Box className={classes.actions}>
                            {element}
                            <Button
                                variant="roundedOutlined"
                                href={profile?.handle ? getLensterLink(profile.handle) : '#'}
                                target="__blank"
                                rel="noopener noreferrer"
                                endIcon={<Icons.LinkOut size={18} />}
                                sx={{ cursor: 'pointer' }}>
                                {t.lenster()}
                            </Button>
                        </Box>
                        <Box className={classes.profile}>
                            <WalletConnectedBoundary
                                offChain
                                hideRiskWarningConfirmed
                                expectedChainId={ChainId.Matic}
                                ActionButtonProps={{ variant: 'roundedContained' }}>
                                <Typography className={classes.tips}>{tips}</Typography>
                                <HandlerDescription />
                            </WalletConnectedBoundary>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
