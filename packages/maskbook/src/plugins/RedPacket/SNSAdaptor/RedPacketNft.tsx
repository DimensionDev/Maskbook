import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import {
    useAccount,
    useChainIdValid,
    resolveAddressLinkOnExplorer,
    useWeb3,
    useERC721TokenDetailed,
    EthereumTokenType,
    ERC721ContractDetailed,
} from '@masknet/web3-shared'
import LaunchIcon from '@material-ui/icons/Launch'
import {
    Grid,
    Card,
    CardHeader,
    Typography,
    Link,
    CardMedia,
    CardContent,
    Button,
    Skeleton,
    Box,
} from '@material-ui/core'
import { useState, useCallback } from 'react'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useI18N } from '../../../utils'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import type { RedPacketNftJSONPayload } from '../types'
import { useClaimNftRedpacketCallback } from './hooks/useClaimNftRedpacketCallback'
import { useAvailabilityNftRedPacket } from './hooks/useAvailabilityNftRedPacket'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
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
        minHeight: 38,
        height: 38,
        backgroundColor: '#1C68F3',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
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
        marginTop: 4,
    },
    loadingBox: {
        borderRadius: theme.spacing(1),
        padding: theme.spacing(2),
        background: '#DB0632',
        position: 'relative',
        display: 'flex',
        color: theme.palette.common.white,
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 136,
        boxSizing: 'border-box',
    },
    tokenWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    tokenImgWrapper: {
        width: 120,
        height: 180,
        overflow: 'hidden',
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
}))
export interface RedPacketNftProps {
    payload: RedPacketNftJSONPayload
}

export function RedPacketNft({ payload }: RedPacketNftProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const web3 = useWeb3()
    const account = useAccount()
    const chainIdValid = useChainIdValid()
    const [disabled, setDisabled] = useState(false)
    //#region remote controlled select provider dialog
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion
    const [claimState, claimCallback, resetCallback] = useClaimNftRedpacketCallback(
        payload.id,
        web3.eth.accounts.sign(account, payload.privateKey).signature,
    )

    const openAddressLinkOnExplorer = useCallback(() => {
        window.open(
            resolveAddressLinkOnExplorer(payload.chainId, payload.contractAddress),
            '_blank',
            'noopener noreferrer',
        )
    }, [payload])

    const { value: availability, loading } = useAvailabilityNftRedPacket(payload.id, account)
    const { value: erc721TokenDetailed } = useERC721TokenDetailed(
        availability
            ? ({
                  type: EthereumTokenType.ERC721,
                  address: payload.contractAddress,
                  chainId: payload.chainId,
                  name: payload.contractName,
                  symbol: '',
                  baseURI: '',
                  iconURL: payload.contractTokenURI,
              } as ERC721ContractDetailed)
            : undefined,
        availability?.claimed_id,
    )

    if (!availability || loading)
        return (
            <EthereumChainBoundary chainId={payload.chainId}>
                <Card className={classes.loadingBox} component="article" elevation={0}>
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="30%"
                        height={12}
                        style={{ marginTop: 16 }}
                    />
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="40%"
                        height={12}
                        style={{ marginTop: 16 }}
                    />
                    <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="70%"
                        height={12}
                        style={{ marginBottom: 16 }}
                    />
                </Card>
            </EthereumChainBoundary>
        )

    return (
        <EthereumChainBoundary chainId={payload.chainId}>
            <div className={classes.root}>
                <Card className={classes.card} component="article" elevation={0}>
                    <CardHeader
                        className={classNames(classes.title, availability.isEnd ? classes.hide : '', classes.whiteText)}
                        title={payload.message}
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
                            <div className={classes.tokenImgWrapper}>
                                <img className={classes.tokenImg} src={erc721TokenDetailed?.info.image} />
                            </div>
                            <Typography className={classes.claimedText}>You got 1 {payload.contractName}</Typography>
                        </Box>
                    ) : (
                        <CardMedia
                            className={classes.image}
                            component="div"
                            image={new URL('./assets/redpacket.nft.png', import.meta.url).toString()}
                            title="nft icon">
                            <Typography className={classes.remain}>
                                {availability.claimedAmount}/{availability.totalAmount} Collectibles
                            </Typography>
                        </CardMedia>
                    )}

                    <CardContent>
                        <Typography variant="body1" className={classes.whiteText}>
                            This image contains a Red Packet Use Maskbook to open it.
                        </Typography>
                    </CardContent>
                    <div className={classes.footer}>
                        <Link
                            href="https://mask.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={classes.whiteText}>
                            Mask.io
                        </Link>
                        <Typography variant="body1">From: @{payload.senderName}</Typography>
                    </div>
                </Card>
                {availability.isEnd ? (
                    <Card className={classes.coverCard}>
                        <CardHeader
                            className={classNames(classes.title, classes.dim, classes.dimWhiteText)}
                            title={payload.message}
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
                                {availability.expired
                                    ? t('plugin_red_packet_expired')
                                    : t('plugin_red_packet_completed')}
                            </Typography>
                        </div>
                    </Card>
                ) : (
                    <Grid container spacing={2} className={classes.buttonWrapper}>
                        <Grid item xs={availability.isClaimed ? 12 : 6}>
                            <Button
                                className={classes.button}
                                fullWidth
                                onClick={() => {}}
                                size="large"
                                variant="contained">
                                {t('share')}
                            </Button>
                        </Grid>
                        {availability.isClaimed ? null : (
                            <Grid item xs={6}>
                                <EthereumWalletConnectedBoundary
                                    classes={{
                                        connectWallet: classes.button,
                                        unlockMetaMask: classes.button,
                                    }}>
                                    <ActionButton
                                        variant="contained"
                                        size="large"
                                        loading={false}
                                        disabled={false}
                                        onClick={claimCallback}
                                        className={classes.button}
                                        fullWidth>
                                        {t('plugin_red_packet_claim')}
                                    </ActionButton>
                                </EthereumWalletConnectedBoundary>
                            </Grid>
                        )}
                    </Grid>
                )}
            </div>
        </EthereumChainBoundary>
    )
}
