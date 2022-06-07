import { makeStyles } from '@masknet/theme'
import { explorerResolver, TransactionStateType, networkResolver } from '@masknet/web3-shared-evm'
import LaunchIcon from '@mui/icons-material/Launch'
import { Card, CardHeader, Typography, Link, CardMedia, CardContent, Button, Box, Skeleton } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N as useBaseI18N } from '../../../utils'
import { useI18N } from '../locales'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import type { RedPacketNftJSONPayload } from '../types'
import { useClaimNftRedpacketCallback } from './hooks/useClaimNftRedpacketCallback'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket'
import classNames from 'classnames'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { openWindow } from '@masknet/shared-base-ui'
import { useAccount, useNetworkType, useWeb3 } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PluginWalletConnectIcon, SharedIcon } from '@masknet/icons'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
        width: '100%',
    },
    actions: {
        paddingTop: theme.spacing(2),
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(1),
        background: '#DB0632',
        position: 'relative',
        color: theme.palette.common.white,
        boxSizing: 'border-box',
        backgroundImage: `url(${new URL('./assets/background.png', import.meta.url)})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
    },
    loadingCard: {
        width: '100%',
        height: 360,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCardImg: {
        width: 200,
    },
    title: {
        textAlign: 'left',
    },
    image: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: 160,
        backgroundSize: 'contain',
        textAlign: 'center',
        justifyContent: 'center',
    },
    remain: {
        marginLeft: 28,
        paddingTop: 40,
        color: '#FAD85A',
        width: '100%',
    },
    claim: {
        textAlign: 'center',
        marginTop: theme.spacing(1),
    },
    button: {
        backgroundColor: theme.palette.maskColor.dark,
        color: 'white',
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
        margin: '0 !important',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between !important',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingBottom: theme.spacing(1),
    },
    link: {
        display: 'flex',
        width: 120,
        cursor: 'pointer',
        '&>:first-child': {
            marginRight: theme.spacing(1),
        },
    },
    buttonWrapper: {
        marginTop: 0,
        display: 'flex',
    },
    loadingBox: {
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
        background: '#DB0632',
        position: 'relative',
        display: 'flex',
        color: theme.palette.common.white,
        flexDirection: 'column',
        height: 360,
        boxSizing: 'border-box',
    },
    tokenWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    tokenImg: {
        width: '100%',
        borderRadius: 6,
    },
    claimedText: {
        fontSize: 18,
        fontWeight: 500,
    },
    coverCard: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        top: 0,
        borderRadius: 6,
        width: '100%',
        height: '100%',
    },
    hide: {
        opacity: 0,
    },
    dim: {
        opacity: 0.5,
    },
    whiteText: {
        color: 'white',
    },
    dimWhiteText: {
        color: '#e3e3e3',
    },
    badge: {
        width: 76,
        height: 27,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(21, 24, 27, 0.5)',
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
    },
    snackBarText: {
        fontSize: 14,
    },
    snackBarLink: {
        color: 'white',
    },
    openIcon: {
        display: 'flex',
        width: 18,
        height: 18,
        marginLeft: 2,
    },
    snackBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'translateY(1px)',
    },
    loadingTokenImg: {
        opacity: 0.4,
    },
    tokenImgSpinner: {
        position: 'absolute',
        opacity: 0.4,
        top: 65,
        left: 40,
        width: 30,
        height: 30,
    },
    loadingText: {
        textAlign: 'center',
        fontSize: 24,
    },
    loadingWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorCard: {
        height: 360,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errImage: {
        width: 220,
    },
    errorButton: {
        borderColor: 'white',
        minHeight: 30,
        width: 100,
        marginTop: 16,
        '&:hover': {
            borderColor: 'white',
        },
    },
    ellipsis: {
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: 400,
        fontSize: '1.5rem',
    },
    assetPlayerIframe: {
        marginBottom: 16,
        height: '160px !important',
    },
    imgWrapper: {
        maxWidth: 180,
        marginBottom: 10,
    },
    assetPlayerVideoIframe: {
        minWidth: 'fit-content',
    },
    loadingFailImage: {
        height: 160,
        width: 120,
    },
}))
export interface RedPacketNftProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNft({ payload }: RedPacketNftProps) {
    const { t: i18n } = useBaseI18N()
    const t = useI18N()
    const { classes } = useStyles()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)

    const {
        value: availability,
        loading,
        retry: retryAvailability,
        error: availabilityError,
    } = useAvailabilityNftRedPacket(payload.id, account, payload.chainId)
    const [claimState, claimCallback, resetCallback] = useClaimNftRedpacketCallback(
        payload.id,
        availability?.totalAmount,
        web3?.eth.accounts.sign(account, payload.privateKey).signature ?? '',
    )

    const isClaiming = claimState.type === TransactionStateType.WAIT_FOR_CONFIRMING

    const openAddressLinkOnExplorer = useCallback(() => {
        openWindow(explorerResolver.addressLink(payload.chainId, payload.contractAddress))
    }, [payload])

    const [sourceType, setSourceType] = useState('')

    useEffect(() => {
        if (![TransactionStateType.CONFIRMED, TransactionStateType.FAILED].includes(claimState.type)) {
            return
        }

        if (claimState.type === TransactionStateType.CONFIRMED && claimState.no === 0) {
            retryAvailability()
        }

        resetCallback()
    }, [claimState.type, retryAvailability])

    useEffect(() => {
        retryAvailability()
        resetCallback()
    }, [account])

    const rpNftImg = new URL('./assets/redpacket.nft.png', import.meta.url).toString()
    // #region on share
    const postLink = usePostLink()
    const networkType = useNetworkType(NetworkPluginID.PLUGIN_EVM)
    const shareText = useMemo(() => {
        const isTwitterOrFacebook = isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
        const options = {
            sender: payload.senderName,
            payload: postLink.toString(),
            network: networkResolver.networkName(networkType) || '',
            account: isTwitter(activatedSocialNetworkUI) ? i18n('twitter_account') : i18n('facebook_account'),
        }
        if (availability?.isClaimed) {
            return isTwitterOrFacebook
                ? t.nft_share_claimed_message(options)
                : t.nft_share_claimed_message_not_twitter(options)
        }
        return isTwitterOrFacebook
            ? t.nft_share_foreshow_message(options)
            : t.nft_share_foreshow_message_not_twitter(options)
    }, [availability?.isClaimed, t, i18n])

    const onShare = useCallback(() => {
        if (shareText) activatedSocialNetworkUI.utils.share?.(shareText)
    }, [shareText])
    // #endregion

    if (availabilityError)
        return (
            <div className={classes.root}>
                <Card className={classNames(classes.card, classes.errorCard)} component="article" elevation={0}>
                    <img className={classes.errImage} src={rpNftImg} />
                    <Typography className={classes.whiteText} variant="h5">
                        {i18n('loading_failed')}
                    </Typography>
                    <Button
                        onClick={retryAvailability}
                        className={classNames(classes.errorButton, classes.whiteText)}
                        variant="outlined">
                        {i18n('try_again')}
                    </Button>
                </Card>
            </div>
        )
    if (!availability || loading)
        return (
            <Card className={classes.loadingBox} component="article" elevation={0}>
                <Skeleton animation="wave" variant="rectangular" width="30%" height={18} style={{ marginTop: 16 }} />
                <Skeleton animation="wave" variant="rectangular" width="40%" height={18} style={{ marginTop: 24 }} />
                <Skeleton animation="wave" variant="rectangular" width="70%" height={18} style={{ marginTop: 24 }} />
            </Card>
        )

    return (
        <div className={classes.root}>
            <Card className={classes.card} component="article" elevation={0}>
                <CardHeader
                    className={classNames(classes.title, availability.isEnd ? classes.hide : '', classes.whiteText)}
                    title={<Typography className={classes.ellipsis}>{payload.message}</Typography>}
                    subheader={
                        <span
                            className={classNames(classes.link, classes.whiteText)}
                            onClick={openAddressLinkOnExplorer}>
                            <Typography variant="body2">{payload.contractName}</Typography>
                            <LaunchIcon fontSize="small" className={classes.dimWhiteText} />
                        </span>
                    }
                />

                {availability.isClaimed ? (
                    <Box className={classes.tokenWrapper}>
                        <NFTCardStyledAssetPlayer
                            chainId={payload.chainId}
                            contractAddress={payload.contractAddress}
                            tokenId={availability.claimed_id}
                            setSourceType={setSourceType}
                            classes={{
                                iframe: classNames(
                                    classes.assetPlayerIframe,
                                    sourceType === 'video' ? classes.assetPlayerVideoIframe : '',
                                ),
                                imgWrapper: classes.imgWrapper,
                                loadingFailImage: classes.loadingFailImage,
                            }}
                            fallbackImage={new URL('./assets/nft-preview.png', import.meta.url)}
                        />

                        <Typography className={classes.claimedText}>You got 1 {payload.contractName}</Typography>
                    </Box>
                ) : (
                    <CardMedia className={classes.image} component="div" image={rpNftImg}>
                        <Typography className={classes.remain}>
                            {availability.claimedAmount}/{availability.totalAmount} {i18n('collectibles_name')}
                        </Typography>
                    </CardMedia>
                )}

                <CardContent>
                    <Typography variant="body1" className={classes.whiteText}>
                        {t.nft_tip()}
                    </Typography>
                </CardContent>
                <div className={classes.footer}>
                    <Link
                        href="https://mask.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classes.whiteText}>
                        <Typography variant="body1">Mask.io</Typography>
                    </Link>
                    <Typography variant="body1">From: @{payload.senderName}</Typography>
                </div>
            </Card>
            {availability.isEnd ? (
                <Card className={classes.coverCard}>
                    <CardHeader
                        className={classNames(classes.title, classes.dim, classes.dimWhiteText)}
                        title={<Typography className={classes.ellipsis}>{payload.message}</Typography>}
                        subheader={
                            <span
                                className={classNames(classes.link, classes.dimWhiteText)}
                                onClick={openAddressLinkOnExplorer}>
                                <Typography variant="body2">{payload.contractName}</Typography>
                                <LaunchIcon fontSize="small" className={classes.dimWhiteText} />
                            </span>
                        }
                    />
                    <div className={classNames(classes.badge, classes.whiteText)}>
                        <Typography variant="body2" className={classes.badgeText}>
                            {availability.expired ? t.expired() : t.completed()}
                        </Typography>
                    </div>
                </Card>
            ) : availability.isClaimedAll || availability.isCompleted ? null : (
                <Box className={classes.buttonWrapper}>
                    <Box sx={{ flex: 1, padding: 1.5 }}>
                        <Button
                            startIcon={<SharedIcon style={{ fontSize: 18 }} />}
                            className={classes.button}
                            fullWidth
                            onClick={onShare}
                            variant="contained">
                            {i18n('share')}
                        </Button>
                    </Box>
                    {availability.isClaimed ? null : (
                        <Box sx={{ flex: 1, padding: 1.5 }}>
                            <ChainBoundary
                                expectedPluginID={NetworkPluginID.PLUGIN_EVM}
                                expectedChainId={payload.chainId}
                                renderInTimeline>
                                <WalletConnectedBoundary
                                    startIcon={<PluginWalletConnectIcon style={{ fontSize: 18 }} />}
                                    classes={{
                                        connectWallet: classes.button,
                                        unlockMetaMask: classes.button,
                                        gasFeeButton: classes.button,
                                    }}
                                    renderInTimeline>
                                    <ActionButton
                                        variant="contained"
                                        loading={isClaiming}
                                        disabled={isClaiming}
                                        onClick={claimCallback}
                                        className={classes.button}
                                        fullWidth>
                                        {isClaiming ? t.claiming() : t.claim()}
                                    </ActionButton>
                                </WalletConnectedBoundary>
                            </ChainBoundary>
                        </Box>
                    )}
                </Box>
            )}
        </div>
    )
}
