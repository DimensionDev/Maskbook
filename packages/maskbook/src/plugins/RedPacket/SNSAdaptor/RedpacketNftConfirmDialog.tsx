import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    isNative,
    resolveAddressLinkOnExplorer,
    useChainId,
    useWallet,
    useAccount,
    ERC721ContractDetailed,
    ERC721TokenDetailed,
} from '@masknet/web3-shared'
import classNames from 'classnames'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { Button, Grid, Link, Typography, DialogContent, List, ListItem } from '@material-ui/core'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import LaunchIcon from '@material-ui/icons/Launch'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontSize: 16,
    },
    link: {
        display: 'flex',
        marginLeft: theme.spacing(0.5),
    },
    account: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    message: {
        borderLeft: '2px solid red',
        paddingLeft: theme.spacing(0.5),
    },
    text: {
        fontSize: 16,
    },
    bold: {
        fontWeight: 500,
    },
    tokenWrapper: {
        float: 'right',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
        height: 24,
        width: 24,
    },
    tokenSelector: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        width: 530,
        height: 390,
        overflowY: 'auto',
        background: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        borderRadius: 12,
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
        padding: theme.spacing(1, 1.5, 1, 1.5),
    },
    tokenSelectorWrapper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 6,
        padding: 0,
        marginBottom: theme.spacing(2.5),
        background: theme.palette.mode === 'light' ? '#fff' : '#2F3336',
        width: 120,
        height: 180,
        overflow: 'hidden',
    },
    imgWrapper: {
        height: 160,
        width: '100%',
        overflow: 'hidden',
    },
    nftImg: {
        maxWidth: '100%',
    },
    nftNameWrapper: {
        width: '100%',
        background: theme.palette.mode === 'light' ? 'none' : '#2F3336',
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        paddingTop: 2,
        paddingBottom: 1,
    },
    nftName: {
        minHeight: 30,
        marginLeft: 8,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    buttonWrapper: {
        marginTop: 16,
    },
    button: {
        minHeight: 36,
        height: 36,
    },
    cancelButton: {
        backgroundColor: theme.palette.mode === 'light' ? '#F7F9FA' : '#17191D',
        color: '#1C68F3',
        '&:hover': {
            backgroundColor: theme.palette.mode === 'light' ? '#EDF1F2' : '#16181C',
        },
    },
    sendButton: {
        backgroundColor: '#1C68F3',
        '&:hover': {
            backgroundColor: '#1854c4',
        },
    },
}))
export interface RedpacketNftConfirmDialogProps {
    open: boolean
    onClose: () => void
    contract: ERC721ContractDetailed
    tokenList: ERC721TokenDetailed[]
    message: string
}
export function RedpacketNftConfirmDialog(props: RedpacketNftConfirmDialogProps) {
    const { classes } = useStyles()
    const { open, onClose, message, contract, tokenList } = props
    const wallet = useWallet()
    const account = useAccount()
    const chainId = useChainId()
    const { t } = useI18N()

    const nfts: { img: string; name: string }[] = Array.from({ length: 10 })

    nfts.fill({
        img: new URL('./assets/nft.png', import.meta.url).toString(),
        name: 'Token',
    })

    return (
        <InjectedDialog open={open} onClose={onClose} title={t('confirm')} maxWidth="xs">
            <DialogContent className={classes.root}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography color="textPrimary" variant="body1" className={classes.text}>
                            {t('plugin_red_packet_nft_account_name')}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            color="textPrimary"
                            variant="body1"
                            align="right"
                            className={classNames(classes.account, classes.bold, classes.text)}>
                            ({wallet?.name}) {formatEthereumAddress(account, 4)}
                            {isNative(wallet?.address!) ? null : (
                                <Link
                                    color="textPrimary"
                                    className={classes.link}
                                    href={resolveAddressLinkOnExplorer(chainId, account)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={stop}>
                                    <LaunchIcon fontSize="small" />
                                </Link>
                            )}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary" className={classNames(classes.text)}>
                            {t('plugin_red_packet_nft_arrached_message')}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="body1"
                            color="textPrimary"
                            align="right"
                            className={(classes.text, classes.bold)}>
                            {message}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary" className={classNames(classes.text)}>
                            {t('plugin_wallet_collections')}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <div className={classes.tokenWrapper}>
                            {contract.iconURL ? <img className={classes.icon} src={contract.iconURL} /> : null}
                            <Typography
                                variant="body1"
                                color="textPrimary"
                                align="right"
                                className={classNames(classes.text, classes.bold)}>
                                {contract.name}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <List className={classes.tokenSelector}>
                            {tokenList.map((value, i) => (
                                <ListItem key={i.toString()} className={classNames(classes.tokenSelectorWrapper)}>
                                    <div className={classes.imgWrapper}>
                                        <img className={classes.nftImg} src={value.info.image} />
                                    </div>
                                    <div className={classes.nftNameWrapper}>
                                        <Typography className={classes.nftName} color="textSecondary">
                                            {value.info.name}
                                        </Typography>
                                    </div>
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    <Grid item xs={6}>
                        <Typography color="textPrimary" variant="body1" className={classNames(classes.text)}>
                            {t('plugin_red_packet_nft_total_amount')}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            color="textPrimary"
                            align="right"
                            className={classNames(classes.text, classes.bold)}>
                            {tokenList.length}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container spacing={2} className={classes.buttonWrapper}>
                    <Grid item xs={6}>
                        <Button
                            className={classNames(classes.button, classes.cancelButton)}
                            fullWidth
                            onClick={onClose}
                            size="large"
                            variant="contained">
                            {t('cancel')}
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <EthereumWalletConnectedBoundary
                            classes={{
                                connectWallet: classNames(classes.button, classes.sendButton),
                                unlockMetaMask: classNames(classes.button, classes.sendButton),
                            }}>
                            <ActionButton
                                variant="contained"
                                size="large"
                                className={classNames(classes.button, classes.sendButton)}
                                fullWidth>
                                {t('plugin_red_packet_send_symbol', {
                                    amount: tokenList.length,
                                    symbol: tokenList.length > 1 ? 'NFTs' : 'NFT',
                                })}
                            </ActionButton>
                        </EthereumWalletConnectedBoundary>
                    </Grid>
                </Grid>
            </DialogContent>
        </InjectedDialog>
    )
}
