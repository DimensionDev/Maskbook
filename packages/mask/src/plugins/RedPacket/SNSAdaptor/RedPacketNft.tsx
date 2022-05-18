import { makeStyles } from '@masknet/theme'
import {
    useAccount,
    resolveAddressLinkOnExplorer,
    useWeb3,
    resolveNetworkName,
    useNetworkType,
    TransactionStateType,
} from '@masknet/web3-shared-evm'
import LaunchIcon from '@mui/icons-material/Launch'
import { Grid, Card, CardHeader, Typography, Link, CardMedia, CardContent, Button, Box, Skeleton } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
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
import { PluginWalletConnectIcon } from '@masknet/icons'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'

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
        minHeight: 40,
        height: 40,

        backgroundColor: theme.palette.maskColor.dark,
        color: 'white',
        fontSize: 14,
        fontWeight: 700,
        width: '100%',
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
    const { t } = useI18N()
    const { classes } = useStyles()
    const web3 = useWeb3()
    const account = useAccount()

    const {
        value: availability,
        loading,
        retry: retryAvailability,
        error: availabilityError,
    } = useAvailabilityNftRedPacket(payload.id, account)
    const [claimState, claimCallback, resetCallback] = useClaimNftRedpacketCallback(
        payload.id,
        availability?.totalAmount,
        web3.eth.accounts.sign(account, payload.privateKey).signature,
    )

    const isClaiming = claimState.type === TransactionStateType.WAIT_FOR_CONFIRMING

    const openAddressLinkOnExplorer = useCallback(() => {
        openWindow(resolveAddressLinkOnExplorer(payload.chainId, payload.contractAddress))
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
    const networkType = useNetworkType()
    const shareText = availability?.isClaimed
        ? t(
              isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                  ? 'plugin_red_packet_nft_share_claimed_message'
                  : 'plugin_red_packet_nft_share_claimed_message_not_twitter',
              {
                  sender: payload.senderName,
                  payload: postLink,
                  network: resolveNetworkName(networkType),
                  account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
              },
          ).trim()
        : t(
              isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                  ? 'plugin_red_packet_nft_share_foreshow_message'
                  : 'plugin_red_packet_nft_share_foreshow_message_not_twitter',
              {
                  sender: payload.senderName,
                  payload: postLink,
                  network: resolveNetworkName(networkType),
                  account: isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account'),
              },
          ).trim()

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
                        {t('loading_failed')}
                    </Typography>
                    <Button
                        onClick={retryAvailability}
                        className={classNames(classes.errorButton, classes.whiteText)}
                        variant="outlined">
                        {t('try_again')}
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
                            {availability.claimedAmount}/{availability.totalAmount} {t('collectibles_name')}
                        </Typography>
                    </CardMedia>
                )}

                <CardContent>
                    <Typography variant="body1" className={classes.whiteText}>
                        {t('plugin_red_packet_nft_tip')}
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
                            {availability.expired ? t('plugin_red_packet_expired') : t('plugin_red_packet_completed')}
                        </Typography>
                    </div>
                </Card>
            ) : availability.isClaimedAll || availability.isCompleted ? null : (
                <Grid container spacing={2} className={classes.buttonWrapper}>
                    <Grid item xs={availability.isClaimed ? 12 : 6}>
                        <Button className={classes.button} fullWidth onClick={onShare} size="large" variant="contained">
                            {t('share')}
                        </Button>
                    </Grid>
                    {availability.isClaimed ? null : (
                        <Grid item xs={6}>
                            <EthereumChainBoundary chainId={payload.chainId}>
                                <EthereumWalletConnectedBoundary
                                    startIcon={<PluginWalletConnectIcon style={{ fontSize: 18 }} />}
                                    classes={{
                                        connectWallet: classes.button,
                                        unlockMetaMask: classes.button,
                                        gasFeeButton: classes.button,
                                    }}>
                                    <ActionButton
                                        variant="contained"
                                        loading={isClaiming}
                                        disabled={isClaiming}
                                        onClick={claimCallback}
                                        className={classes.button}
                                        fullWidth>
                                        {isClaiming ? t('plugin_red_packet_claiming') : t('plugin_red_packet_claim')}
                                    </ActionButton>
                                </EthereumWalletConnectedBoundary>
                            </EthereumChainBoundary>
                        </Grid>
                    )}
                </Grid>
            )}
        </div>
    )
}
