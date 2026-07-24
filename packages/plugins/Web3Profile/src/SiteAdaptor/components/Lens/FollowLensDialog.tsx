import type { Account, EvmAddress } from '@lens-protocol/client'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import {
    ChainBoundary,
    InjectedDialog,
    setMyLensAccountAddress,
    useAvailableLensAccounts,
    useLensClient,
    useMyLensAccount,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, useSnackbar } from '@masknet/theme'
import { useChainContext, useNetworkContext, useWallet } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Avatar, Box, Button, buttonClasses, CircularProgress, DialogContent, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { first } from 'lodash-es'
import { useCallback, useMemo, useState } from 'react'
import { getFireflyLensProfileLink } from '../../../utils.js'
import { useConfettiExplosion } from '../../hooks/ConfettiExplosion/index.js'
import { useFollow } from '../../hooks/Lens/useFollow.js'
import { useUnfollow } from '../../hooks/Lens/useUnfollow.js'
import { useUpdateFollowingStatus } from '../../hooks/Lens/useUpdateFollowingStatus.js'
import { HandlerDescription } from './HandlerDescription.js'

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
        color: theme.vars.palette.maskColor.main,
        marginTop: 24,
    },
    handle: {
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 400,
        color: theme.vars.palette.maskColor.main,
        margin: theme.spacing(0.5, 0),
    },
    followers: {
        display: 'flex',
        justifyContent: 'center',
        columnGap: 8,
    },
    dialogTitle: {
        background: `${theme.vars.palette.maskColor.bottom}!important`,
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
        color: theme.vars.palette.maskColor.publicMain,
        '&:hover': {
            backgroundColor: '#A1FE27',
            color: theme.vars.palette.maskColor.publicMain,
        },
        [`&.${buttonClasses.disabled}`]: {
            background: '#A1FE27',
            opacity: 0.6,
            color: theme.vars.palette.maskColor.publicMain,
        },
    },
    profile: {
        marginTop: account ? 24 : 44,
        width: '100%',
    },
    tips: {
        marginBottom: theme.spacing(3),
        color: theme.vars.palette.maskColor.main,
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
            backgroundColor: theme.vars.palette.maskColor.thirdMain,
        },
    },
}))

interface Props {
    handle: string
    onClose(): void
}

let task: Promise<void> | undefined

export function FollowLensDialog({ handle, onClose }: Props) {
    const wallet = useWallet()
    const [isHovering, setIsHovering] = useState(false)
    const { classes } = useStyles({ account: !!wallet })
    const { account: walletAccount } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const { pluginID } = useNetworkContext()

    const { enqueueSnackbar } = useSnackbar()
    const lensClient = useLensClient()
    const myLensAccount = useMyLensAccount()
    const myLensAddress = myLensAccount?.account.address

    const { data: lensAccount, isLoading } = useQuery({
        enabled: !!handle && !!open,
        queryKey: ['lens', 'profile-info', !lensClient, handle],
        queryFn: async () => {
            if (!handle || !lensClient) return null
            const lensAccount = await lensClient.getAccountByHandle(handle)
            return lensAccount
        },
    })
    const { data: accounts } = useAvailableLensAccounts()
    const isSelf = isSameAddress(lensAccount?.username?.ownedBy as string, walletAccount)

    const currentAccount = accounts?.find((p) => isSameAddress(p.account.address, myLensAddress)) || first(accounts)
    const targetLensAddress: EvmAddress | undefined = lensAccount?.address
    const { isPending, data: isFollowing } = useQuery({
        queryKey: ['lens', 'following-status', myLensAddress, targetLensAddress, !lensClient],
        queryFn: async () => {
            if (!targetLensAddress || !myLensAddress || !lensClient) return false
            const res = await lensClient.getFollowStatus([
                { account: targetLensAddress, follower: myLensAddress as EvmAddress },
            ])
            const status = res[0].isFollowing
            return status.onChain
        },
        refetchOnWindowFocus: false,
        staleTime: 0,
    })
    const updateFollowingStatus = useUpdateFollowingStatus()

    // #region follow and unfollow event handler
    const { showConfettiExplosion, canvasRef } = useConfettiExplosion()
    const { loading: followLoading, handleFollow } = useFollow({
        accountAddress: lensAccount?.address,
        onSuccess: (width: number, height: number) => {
            showConfettiExplosion(width, height)
            updateFollowingStatus(myLensAddress, targetLensAddress, true)
        },
        onFailed: () => updateFollowingStatus(myLensAddress, targetLensAddress, false),
    })
    const { loading: unfollowLoading, handleUnfollow } = useUnfollow({
        accountAddress: lensAccount?.address as string,
        onSuccess: () => updateFollowingStatus(myLensAddress, targetLensAddress, false),
        onFailed: () => updateFollowingStatus(myLensAddress, targetLensAddress, true),
    })
    // #endregion

    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            if (task) {
                enqueueSnackbar(isFollowing ? <Trans>Lens Unfollow</Trans> : <Trans>Lens Follow</Trans>, {
                    processing: true,
                    detail:
                        isFollowing ?
                            <Trans>Previous unfollow transaction is in processing, please wait and try again.</Trans>
                        :   <Trans>Previous follow transaction is in processing, please wait and try again.</Trans>,
                    autoHideDuration: 2000,
                })
                return
            }
            task = (isFollowing ? handleUnfollow() : handleFollow(event)).finally(() => (task = undefined))
        },
        [handleFollow, handleUnfollow, isFollowing, enqueueSnackbar],
    )

    const accountConditions = !walletAccount || !currentAccount || pluginID !== NetworkPluginID.PLUGIN_EVM
    const operationConditions = followLoading || unfollowLoading
    const disabled = accountConditions || operationConditions

    const buttonText = useMemo(() => {
        if (isFollowing) {
            return isHovering ? <Trans>Unfollow</Trans> : <Trans>Following</Trans>
        }
        switch (lensAccount?.operations?.canFollow.__typename) {
            case 'AccountFollowOperationValidationPassed':
                return <Trans>Follow</Trans>
            case 'AccountFollowOperationValidationUnknown':
                return <Trans>This profile can not be followed.</Trans>
            case 'AccountFollowOperationValidationFailed':
                return <Trans>This profile can not be followed: {lensAccount.operations.canFollow.reason}</Trans>
        }

        return <Trans>Follow</Trans>
    }, [isFollowing, isHovering, lensAccount])

    const tips = useMemo(() => {
        if (pluginID !== NetworkPluginID.PLUGIN_EVM)
            return <Trans>Current wallet does not support to interact with Lens protocol.</Trans>
        else if (lensAccount?.operations?.canFollow.__typename === 'AccountFollowOperationValidationFailed')
            return <Trans>Can not follow: {lensAccount.operations.canFollow.reason}</Trans>
        else if (!currentAccount) {
            return <Trans>The current wallet does not hold a lens and cannot follow/unfollow</Trans>
        }
        return
    }, [lensAccount, pluginID, currentAccount])

    const avatar = lensAccount?.metadata?.picture

    const handleProfileChange = useCallback(
        (profile: Account) => {
            setMyLensAccountAddress(walletAccount, profile.address)
        },
        [walletAccount],
    )

    const loading = followLoading || unfollowLoading || isLoading || isPending

    return (
        <InjectedDialog
            open
            onClose={onClose}
            title={<Trans>Lens</Trans>}
            classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialogContent }}>
            <DialogContent sx={{ padding: 3 }}>
                {!lensAccount && isLoading ?
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 342 }}>
                        <CircularProgress />
                    </Box>
                :   <Box className={classes.container}>
                        <Avatar
                            src={avatar ?? new URL('../../assets/Lens.png', import.meta.url).href}
                            sx={{ width: 64, height: 64 }}
                        />
                        <Typography className={classes.name}>
                            {lensAccount?.metadata?.name ?? lensAccount?.username?.localName}
                        </Typography>
                        <Typography className={classes.handle}>@{handle || '--'}</Typography>
                        <Typography className={classes.followers}>
                            <Trans>
                                <strong>0</strong> Followers <strong>0</strong> Following
                            </Trans>
                        </Typography>
                        <Box className={classes.actions}>
                            {isSelf ?
                                <Button
                                    variant="roundedContained"
                                    className={classes.followAction}
                                    href={handle ? getFireflyLensProfileLink(handle) : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    endIcon={<Icons.LinkOut size={18} />}
                                    sx={{ cursor: 'pointer' }}>
                                    <Trans>View your profile in firefly</Trans>
                                </Button>
                            :   <>
                                    <ChainBoundary
                                        disableConnectWallet
                                        expectedPluginID={pluginID}
                                        expectedChainId={ChainId.Polygon}
                                        ActionButtonPromiseProps={{
                                            variant: 'roundedContained',
                                            className: classes.followAction,
                                            startIcon: null,
                                            disabled,
                                        }}
                                        switchText={<Trans>Switch to Polygon and Follow</Trans>}>
                                        <ActionButton
                                            variant="roundedContained"
                                            className={classes.followAction}
                                            disabled={disabled}
                                            loading={loading}
                                            onClick={handleClick}
                                            onMouseOver={() => setIsHovering(true)}
                                            onMouseOut={() => setIsHovering(false)}>
                                            {buttonText}
                                        </ActionButton>
                                    </ChainBoundary>
                                    <Button
                                        className={classes.linkButton}
                                        variant="roundedOutlined"
                                        href={handle ? getFireflyLensProfileLink(handle) : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        endIcon={<Icons.LinkOut size={18} />}
                                        sx={{ cursor: 'pointer' }}>
                                        <Trans>Firefly</Trans>
                                    </Button>
                                </>
                            }
                        </Box>
                        <Box className={classes.profile}>
                            <WalletConnectedBoundary
                                offChain
                                expectedChainId={ChainId.Polygon}
                                ActionButtonProps={{ variant: 'roundedContained' }}>
                                {tips ?
                                    <Typography className={classes.tips}>{tips}</Typography>
                                :   null}

                                <HandlerDescription
                                    currentAccount={currentAccount?.account}
                                    accounts={accounts}
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
