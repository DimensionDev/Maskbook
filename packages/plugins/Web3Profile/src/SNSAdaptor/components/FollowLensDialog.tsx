import { Icons } from '@masknet/icons'
import { InjectedDialog, WalletConnectedBoundary } from '@masknet/shared'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useFungibleTokenBalance, useWallet } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { FollowModuleType } from '@masknet/web3-providers/types'
import { formatBalance, isLessThan } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Avatar, Box, Button, CircularProgress, DialogContent, Typography } from '@mui/material'
import { first } from 'lodash-es'
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
        display: 'flex',
        flexDirection: 'column',
        rowGap: 12,
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

    // #region profile information
    const { value, loading, retry } = useAsyncRetry(async () => {
        if (!handle || !open || !open) return
        const profile = await Lens.getProfileByHandle(handle)

        if (!profile) return
        const isFollowing = await Lens.queryFollowStatus(account, profile.id)
        const defaultProfile = await Lens.queryDefaultProfileByAddress(account)

        const profiles = await Lens.queryProfilesByAddress(account)

        return {
            profile,
            isFollowing,
            defaultProfile: defaultProfile ?? first(profiles),
        }
    }, [handle, open, account])

    const { isFollowing, profile, defaultProfile } = value ?? {}

    const followModule = useMemo(() => {
        if (profile?.followModule?.type === FollowModuleType.ProfileFollowModule && defaultProfile) {
            return {
                profileFollowModule: {
                    profileId: defaultProfile.id,
                },
            }
        } else if (profile?.followModule?.type === FollowModuleType.FeeFollowModule && profile.followModule.amount) {
            return {
                feeFollowModule: {
                    currency: profile.followModule.amount.asset.address,
                    value: profile.followModule.amount.value,
                },
            }
        }
        return
    }, [profile, defaultProfile])
    // #endregion

    // #region follow and unfollow event handler
    const [{ loading: followLoading }, handleFollow] = useFollow(profile?.id, followModule, retry)
    const [{ loading: unfollowLoading }, handleUnfollow] = useUnfollow(profile?.id, retry)
    // #endregion

    const { value: feeTokenBalance, loading: getBalanceLoading } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        profile?.followModule?.amount?.asset.address ?? '',
    )

    const disabled = useMemo(() => {
        if (
            !!wallet?.owner ||
            chainId !== ChainId.Matic ||
            followLoading ||
            unfollowLoading ||
            (profile?.followModule?.type === FollowModuleType.ProfileFollowModule && !defaultProfile) ||
            (profile?.followModule?.type === FollowModuleType.FeeFollowModule &&
                profile.followModule.amount &&
                (!feeTokenBalance ||
                    isLessThan(
                        formatBalance(feeTokenBalance, profile.followModule.amount.asset.decimals),
                        profile.followModule.amount.value,
                    ))) ||
            profile?.followModule?.type === FollowModuleType.RevertFollowModule
        )
            return true
        return false
    }, [wallet?.owner, chainId, followLoading, unfollowLoading, feeTokenBalance, profile?.followModule])

    const [element] = useHover((isHovering) => {
        const getButtonText = () => {
            if (isFollowing) {
                return isHovering ? t.unfollow() : t.following_action()
            } else if (
                profile?.followModule?.type === FollowModuleType.FeeFollowModule &&
                profile.followModule.amount
            ) {
                return t.follow_for_fees({
                    value: profile.followModule.amount.value,
                    symbol: profile.followModule.amount.asset.symbol,
                })
            }

            return t.follow()
        }
        return (
            <ActionButton
                variant="roundedContained"
                className={classes.followAction}
                disabled={disabled}
                loading={followLoading || unfollowLoading}
                onClick={isFollowing ? handleUnfollow : handleFollow}>
                {getButtonText()}
            </ActionButton>
        )
    })

    const tips = useMemo(() => {
        if (wallet?.owner) return t.follow_wallet_tips()
        else if (chainId !== ChainId.Matic) return t.follow_chain_tips()
        else if (profile?.followModule?.type === FollowModuleType.ProfileFollowModule && !defaultProfile)
            return t.follow_with_profile_tips()
        else if (
            profile?.followModule?.type === FollowModuleType.FeeFollowModule &&
            profile.followModule.amount &&
            (!feeTokenBalance ||
                isLessThan(
                    formatBalance(feeTokenBalance, profile.followModule.amount.asset.decimals),
                    profile.followModule.amount.value,
                ))
        )
            return t.follow_with_charge_tips()
        else if (profile?.followModule?.type === FollowModuleType.RevertFollowModule) return t.follow_with_revert_tips()
        return t.follow_gas_tips()
    }, [wallet?.owner, chainId, profile, feeTokenBalance])

    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t.lens()}
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogContent }}>
            <DialogContent sx={{ padding: 3 }}>
                {loading || getBalanceLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={342}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box className={classes.container}>
                        <Avatar
                            src={
                                profile?.picture?.original.url ??
                                new URL('../assets/Lens.png', import.meta.url).toString()
                            }
                            sx={{ width: 64, height: 64 }}
                        />
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
                                <HandlerDescription
                                    profile={
                                        defaultProfile
                                            ? {
                                                  avatar: defaultProfile.picture?.original.url,
                                                  handle: defaultProfile.handle,
                                              }
                                            : undefined
                                    }
                                />
                            </WalletConnectedBoundary>
                        </Box>
                    </Box>
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
