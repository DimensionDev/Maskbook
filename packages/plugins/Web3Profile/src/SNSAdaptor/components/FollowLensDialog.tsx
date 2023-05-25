import { useMemo, useState, type MouseEvent, useCallback } from 'react'
import { useAsyncRetry, useHover } from 'react-use'
import { first } from 'lodash-es'
import { Icons } from '@masknet/icons'
import {
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    InjectedDialog,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useChainContext, useFungibleTokenBalance, useNetworkContext, useWallet } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { FollowModuleType } from '@masknet/web3-providers/types'
import { formatBalance, isLessThan, isSameAddress, resolveIPFS_URL, ZERO } from '@masknet/web3-shared-base'
import { ChainId, createERC20Token, formatAmount, ProviderType } from '@masknet/web3-shared-evm'
import { Avatar, Box, Button, buttonClasses, CircularProgress, DialogContent, Typography } from '@mui/material'
import { Translate, useI18N } from '../../locales/i18n_generated.js'
import { getLensterLink } from '../../utils.js'
import { useFollow } from '../hooks/Lens/useFollow.js'
import { useUnfollow } from '../hooks/Lens/useUnfollow.js'
import { HandlerDescription } from './HandlerDescription.js'
import { useConfettiExplosion } from '../hooks/ConfettiExplosion/index.js'

const useStyles = makeStyles<{ account: boolean }>()((theme, { account }) => ({
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
        [`&.${buttonClasses.disabled}`]: {
            background: '#A1FE27',
            opacity: 0.6,
            color: theme.palette.maskColor.publicMain,
        },
    },
    profile: {
        marginTop: account ? 24 : 44,
        width: '100%',
    },
    tips: {
        marginBottom: theme.spacing(3),
        color: theme.palette.maskColor.main,
        fontSize: 14,
    },
    canvas: {
        height: '100vh',
        pointerEvents: 'none',
        position: 'fixed',
        width: '100%',
        zIndex: 2,
        top: 0,
        left: 0,
    },
}))

interface Props {
    handle?: string
    onClose(): void
}

let task: Promise<void> | undefined

export function FollowLensDialog({ handle, onClose }: Props) {
    const t = useI18N()

    const wallet = useWallet()
    const [isFollowing, setIsFollowing] = useState(false)
    const { classes } = useStyles({ account: !!wallet })
    const { account, chainId, providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()

    const { showSnackbar, closeSnackbar } = useCustomSnackbar()

    // #region profile information
    const { value, loading } = useAsyncRetry(async () => {
        if (!handle || !open || !open) return
        const profile = await Lens.getProfileByHandle(handle)

        if (!profile) return
        const isFollowing = await Lens.queryFollowStatus(account, profile.id)

        const defaultProfile = await Lens.queryDefaultProfileByAddress(account)

        const profiles = await Lens.queryProfilesByAddress(account)

        setIsFollowing(!!isFollowing)
        return {
            profile,
            isSelf: isSameAddress(profile.ownedBy, account),
            isFollowing,
            defaultProfile: defaultProfile ?? first(profiles),
        }
    }, [handle, open, account])

    const { profile, defaultProfile, isSelf } = value ?? {}

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

    const approved = useMemo(() => {
        if (!profile?.followModule?.amount?.asset) return { amount: ZERO.toFixed() }
        const { address, name, symbol, decimals } = profile.followModule.amount.asset
        const token = createERC20Token(chainId, address, name, symbol, decimals)
        const amount = formatAmount(profile.followModule.amount.value, decimals)

        return {
            token,
            amount,
        }
    }, [profile?.followModule?.amount, chainId])

    // #region follow and unfollow event handler
    const { showConfettiExplosion, canvasRef } = useConfettiExplosion()
    const { loading: followLoading, handleFollow } = useFollow(
        profile?.id,
        followModule,
        !!defaultProfile,
        (event: MouseEvent<HTMLElement>) => {
            showConfettiExplosion(event.currentTarget.offsetWidth, event.currentTarget.offsetHeight)
            setIsFollowing(true)
        },
        () => setIsFollowing(false),
    )
    const { loading: unfollowLoading, handleUnfollow } = useUnfollow(
        profile?.id,
        (event: MouseEvent<HTMLElement>) => {
            setIsFollowing(false)
        },
        () => setIsFollowing(true),
    )
    // #endregion

    const { value: feeTokenBalance, loading: getBalanceLoading } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        profile?.followModule?.amount?.asset.address ?? '',
    )

    const handleClick = useCallback(
        (event: MouseEvent<HTMLElement>) => {
            if (task) {
                showSnackbar(isFollowing ? t.lens_unfollow() : t.lens_follow(), {
                    processing: true,
                    message: isFollowing ? t.lens_unfollow_processing_tips() : t.lens_follow_processing_tips(),
                    autoHideDuration: 2000,
                })
                return
            }
            task = (isFollowing ? handleUnfollow(event) : handleFollow(event)).finally(() => (task = undefined))
        },
        [handleFollow, handleUnfollow, isFollowing],
    )

    const disabled = useMemo(() => {
        if (
            !account ||
            !!wallet?.owner ||
            pluginID !== NetworkPluginID.PLUGIN_EVM ||
            providerType === ProviderType.Fortmatic ||
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
    }, [
        account,
        wallet?.owner,
        chainId,
        followLoading,
        unfollowLoading,
        feeTokenBalance,
        profile?.followModule,
        pluginID,
    ])

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
            <EthereumERC20TokenApprovedBoundary
                spender={value?.profile.followModule?.contractAddress}
                amount={approved.amount}
                token={!isFollowing ? approved.token : undefined}
                showHelperToken={false}
                ActionButtonProps={{
                    variant: 'roundedContained',
                    className: classes.followAction,
                    disabled,
                }}
                infiniteUnlockContent={t.unlock_token_tips({
                    value: value?.profile.followModule?.amount?.value ?? ZERO.toFixed(),
                    symbol: approved.token?.symbol ?? '',
                })}
                failedContent={t.unlock_token_tips({
                    value: value?.profile.followModule?.amount?.value ?? ZERO.toFixed(),
                    symbol: approved.token?.symbol ?? '',
                })}>
                <ChainBoundary
                    disableConnectWallet
                    expectedPluginID={pluginID}
                    expectedChainId={ChainId.Matic}
                    ActionButtonPromiseProps={{
                        variant: 'roundedContained',
                        className: classes.followAction,
                        startIcon: null,
                        disabled,
                    }}
                    switchText={t.switch_network_tips()}>
                    <ActionButton
                        variant="roundedContained"
                        className={classes.followAction}
                        disabled={disabled}
                        loading={followLoading || unfollowLoading || loading}
                        onClick={handleClick}>
                        {getButtonText()}
                    </ActionButton>
                </ChainBoundary>
            </EthereumERC20TokenApprovedBoundary>
        )
    })

    const tips = useMemo(() => {
        if (isSelf && profile) return t.edit_profile_tips({ profile: profile.handle })
        if (wallet?.owner || pluginID !== NetworkPluginID.PLUGIN_EVM || providerType === ProviderType.Fortmatic)
            return t.follow_wallet_tips()
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
        else if (!defaultProfile) {
            return t.follow_gas_tips()
        }
        return
    }, [wallet?.owner, chainId, profile, feeTokenBalance, pluginID, providerType, isSelf])

    const avatar = useMemo(() => {
        if (!profile?.picture?.original) return
        return resolveIPFS_URL(profile?.picture?.original.url)
    }, [profile?.picture?.original])

    return (
        <InjectedDialog
            open
            onClose={onClose}
            title={t.lens()}
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogContent }}>
            <DialogContent sx={{ padding: 3 }}>
                {!value && (loading || getBalanceLoading) ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={342}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box className={classes.container}>
                        <Avatar
                            src={avatar ?? new URL('../assets/Lens.png', import.meta.url).toString()}
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
                            {isSelf ? (
                                <Button
                                    variant="roundedContained"
                                    className={classes.followAction}
                                    href={profile?.handle ? getLensterLink(profile.handle) : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    endIcon={<Icons.LinkOut size={18} />}
                                    sx={{ cursor: 'pointer' }}>
                                    {t.edit_profile_in_lenster()}
                                </Button>
                            ) : (
                                <>
                                    {element}
                                    <Button
                                        variant="roundedOutlined"
                                        href={profile?.handle ? getLensterLink(profile.handle) : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        endIcon={<Icons.LinkOut size={18} />}
                                        sx={{ cursor: 'pointer' }}>
                                        {t.lenster()}
                                    </Button>
                                </>
                            )}
                        </Box>
                        <Box className={classes.profile}>
                            <WalletConnectedBoundary
                                offChain
                                hideRiskWarningConfirmed
                                expectedChainId={ChainId.Matic}
                                ActionButtonProps={{ variant: 'roundedContained' }}>
                                {tips ? <Typography className={classes.tips}>{tips}</Typography> : null}
                                <HandlerDescription
                                    profile={
                                        defaultProfile
                                            ? {
                                                  avatar: defaultProfile.picture?.original?.url,
                                                  handle: defaultProfile.handle,
                                              }
                                            : undefined
                                    }
                                />
                            </WalletConnectedBoundary>
                        </Box>
                    </Box>
                )}
                <canvas
                    className={classes.canvas}
                    id="follow-button-confetto"
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
