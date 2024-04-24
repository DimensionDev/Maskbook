import { Icons } from '@masknet/icons'
import {
    ChainBoundary,
    EthereumERC20TokenApprovedBoundary,
    InjectedDialog,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID, PersistentStorages } from '@masknet/shared-base'
import { ActionButton, makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useChainContext, useFungibleTokenBalance, useNetworkContext, useWallet } from '@masknet/web3-hooks-base'
import { Lens } from '@masknet/web3-providers'
import { FollowModuleType, type LensBaseAPI } from '@masknet/web3-providers/types'
import { ZERO, formatBalance, isLessThan, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, ProviderType, createERC20Token, formatAmount } from '@masknet/web3-shared-evm'
import { Avatar, Box, Button, CircularProgress, DialogContent, Typography, buttonClasses } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { useCallback, useMemo, useState, type MouseEvent } from 'react'
import { useAsyncRetry } from 'react-use'
import { Web3ProfileTrans, useWeb3ProfileTrans } from '../../../locales/i18n_generated.js'
import { getFireflyLensProfileLink, getProfileAvatar } from '../../../utils.js'
import { useConfettiExplosion } from '../../hooks/ConfettiExplosion/index.js'
import { useFollow } from '../../hooks/Lens/useFollow.js'
import { useUnfollow } from '../../hooks/Lens/useUnfollow.js'
import { HandlerDescription } from './HandlerDescription.js'
import { useUpdateFollowingStatus } from '../../hooks/Lens/useUpdateFollowingStatus.js'

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
    linkButton: {
        '&:hover': {
            backgroundColor: theme.palette.maskColor.thirdMain,
        },
    },
}))

interface Props {
    handle?: string
    onClose(): void
}

let task: Promise<void> | undefined

export function FollowLensDialog({ handle, onClose }: Props) {
    const t = useWeb3ProfileTrans()

    const wallet = useWallet()
    const [currentProfile, setCurrentProfile] = useState<LensBaseAPI.Profile>()
    const [isHovering, setIsHovering] = useState(false)
    const { classes } = useStyles({ account: !!wallet })
    const { account, chainId, providerType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()

    const { showSnackbar } = useCustomSnackbar()

    // #region profile information
    const { value, loading } = useAsyncRetry(async () => {
        if (!handle || !open || !open) return
        const profile = await Lens.getProfileByHandle(handle)

        if (!profile) return

        const defaultProfile = await Lens.queryDefaultProfileByAddress(account)

        const profiles = await Lens.queryProfilesByAddress(account)

        const latestProfile = PersistentStorages.Settings.storage.latestLensProfile?.value
        setCurrentProfile((prev) => {
            const profile = defaultProfile ?? profiles.find((x) => x.id === latestProfile) ?? first(profiles)
            if (!prev && profile) {
                if (latestProfile) PersistentStorages.Settings.storage.latestLensProfile.setValue(profile.id)
                return profile
            }
            return prev
        })
        return {
            profile,
            isSelf: isSameAddress(profile.ownedBy.address, account),
            profiles,
            defaultProfile: defaultProfile || first(profiles),
        }
    }, [handle, open, account])

    const { profile, defaultProfile, isSelf, profiles } = value || {}

    const currentProfileId = currentProfile?.id
    const targetProfileId = value?.profile.id
    const { isPending, data: isFollowing } = useQuery({
        queryKey: ['lens', 'following-status', currentProfileId, handle, targetProfileId],
        queryFn: async () => {
            if (!targetProfileId || !currentProfile) return false
            const result = await Lens.queryFollowStatus(currentProfile.id, targetProfileId)
            return result
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
    })
    const updateFollowingStatus = useUpdateFollowingStatus()

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
                    currency: profile.followModule.amount.asset.contract.address,
                    value: profile.followModule.amount.value,
                },
            }
        }
        return
    }, [profile, defaultProfile])
    // #endregion

    const approved = useMemo(() => {
        if (!profile?.followModule?.amount?.asset) return { amount: ZERO.toFixed() }
        const {
            contract: { address },
            name,
            symbol,
            decimals,
        } = profile.followModule.amount.asset
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
        currentProfile?.id,
        followModule,
        currentProfile?.signless,
        (event: MouseEvent<HTMLElement>) => {
            showConfettiExplosion(event.currentTarget.offsetWidth, event.currentTarget.offsetHeight)
            updateFollowingStatus(currentProfileId, handle, true)
        },
        () => updateFollowingStatus(currentProfileId, handle, false),
    )
    const { loading: unfollowLoading, handleUnfollow } = useUnfollow(
        profile?.id,
        currentProfile?.id,
        currentProfile?.signless,
        () => updateFollowingStatus(currentProfileId, handle, false),
        () => updateFollowingStatus(currentProfileId, handle, true),
    )
    // #endregion

    const { data: feeTokenBalance, isPending: getBalanceLoading } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        profile?.followModule?.amount?.asset.contract.address ?? '',
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
            !currentProfile ||
            !!wallet?.owner ||
            pluginID !== NetworkPluginID.PLUGIN_EVM ||
            providerType === ProviderType.Fortmatic ||
            followLoading ||
            unfollowLoading ||
            profile?.followModule?.type === FollowModuleType.UnknownFollowModule ||
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
        currentProfile,
        account,
        wallet?.owner,
        chainId,
        followLoading,
        unfollowLoading,
        feeTokenBalance,
        profile?.followModule,
        pluginID,
    ])

    const buttonText = useMemo(() => {
        if (isFollowing) {
            return isHovering ? t.unfollow() : t.following_action()
        } else if (profile?.followModule?.type === FollowModuleType.UnknownFollowModule) {
            return t.can_not_follow()
        } else if (profile?.followModule?.type === FollowModuleType.FeeFollowModule && profile.followModule.amount) {
            return t.follow_for_fees({
                value: profile.followModule.amount.value,
                symbol: profile.followModule.amount.asset.symbol,
            })
        }

        return t.follow()
    }, [isFollowing, isHovering, profile])

    const tips = useMemo(() => {
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
        else if (!currentProfile) {
            return t.follow_with_out_handle_tips()
        }
        return
    }, [wallet?.owner, chainId, profile, feeTokenBalance, pluginID, providerType, isSelf, currentProfile])

    const avatar = useMemo(() => getProfileAvatar(profile), [profile])

    const handleProfileChange = useCallback((profile: LensBaseAPI.Profile) => {
        setCurrentProfile(profile)
        PersistentStorages.Settings.storage.latestLensProfile.setValue(profile.id)
    }, [])

    return (
        <InjectedDialog
            open
            onClose={onClose}
            title={t.lens()}
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogContent }}>
            <DialogContent sx={{ padding: 3 }}>
                {!value && (loading || getBalanceLoading) ?
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={342}>
                        <CircularProgress />
                    </Box>
                :   <Box className={classes.container}>
                        <Avatar
                            src={avatar ?? new URL('../../assets/Lens.png', import.meta.url).toString()}
                            sx={{ width: 64, height: 64 }}
                        />
                        <Typography className={classes.name}>
                            {profile?.metadata?.displayName ?? profile?.handle.localName}
                        </Typography>
                        <Typography className={classes.handle}>@{profile?.handle.localName}</Typography>
                        <Typography className={classes.followers}>
                            <Web3ProfileTrans.followers
                                components={{ strong: <strong /> }}
                                values={{ followers: String(profile?.stats.followers ?? '0') }}
                            />
                            <Web3ProfileTrans.following
                                components={{ strong: <strong /> }}
                                values={{ following: String(profile?.stats.following ?? '0') }}
                            />
                        </Typography>
                        <Box className={classes.actions}>
                            {isSelf ?
                                <Button
                                    variant="roundedContained"
                                    className={classes.followAction}
                                    href={profile?.handle ? getFireflyLensProfileLink(profile.handle.localName) : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    endIcon={<Icons.LinkOut size={18} />}
                                    sx={{ cursor: 'pointer' }}>
                                    {t.view_profile_in_firefly()}
                                </Button>
                            :   <>
                                    <EthereumERC20TokenApprovedBoundary
                                        spender={value?.profile.followModule?.contract?.address}
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
                                                loading={followLoading || unfollowLoading || loading || isPending}
                                                onClick={handleClick}
                                                onMouseOver={() => setIsHovering(true)}
                                                onMouseOut={() => setIsHovering(false)}>
                                                {buttonText}
                                            </ActionButton>
                                        </ChainBoundary>
                                    </EthereumERC20TokenApprovedBoundary>
                                    <Button
                                        className={classes.linkButton}
                                        variant="roundedOutlined"
                                        href={
                                            profile?.handle ? getFireflyLensProfileLink(profile.handle.localName) : '#'
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        endIcon={<Icons.LinkOut size={18} />}
                                        sx={{ cursor: 'pointer' }}>
                                        {t.firefly()}
                                    </Button>
                                </>
                            }
                        </Box>
                        <Box className={classes.profile}>
                            <WalletConnectedBoundary
                                offChain
                                hideRiskWarningConfirmed
                                expectedChainId={ChainId.Matic}
                                ActionButtonProps={{ variant: 'roundedContained' }}>
                                {tips ?
                                    <Typography className={classes.tips}>{tips}</Typography>
                                :   null}

                                <HandlerDescription
                                    currentProfile={currentProfile}
                                    profiles={profiles}
                                    onChange={handleProfileChange}
                                />
                            </WalletConnectedBoundary>
                        </Box>
                    </Box>
                }
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
