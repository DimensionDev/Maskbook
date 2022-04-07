import { useMemo, useCallback, useEffect, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    resolveAddressLinkOnExplorer,
    useChainId,
    useWallet,
    useAccount,
    ERC721ContractDetailed,
    ERC721TokenDetailed,
    useWeb3,
    TransactionStateType,
    isNativeTokenAddress,
    formatNFT_TokenId,
} from '@masknet/web3-shared-evm'
import { InjectedDialog, NFTCardStyledAssetPlayer } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import classNames from 'classnames'
import { Button, Grid, Link, Typography, DialogContent, List, ListItem } from '@mui/material'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import LaunchIcon from '@mui/icons-material/Launch'
import { useI18N } from '../../../utils'
import { useCreateNftRedpacketCallback } from './hooks/useCreateNftRedpacketCallback'
import { useCurrentIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCompositionContext } from '@masknet/plugin-infra'
import { RedPacketNftMetaKey } from '../constants'
import { WalletMessages } from '../../Wallet/messages'
import { RedPacketRPC } from '../messages'

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
        width: '100%',
        height: 420,
        overflowY: 'auto',
        background: theme.palette.background.default,
        borderRadius: 12,
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
        padding: theme.spacing(1.5, 1.5, 1, 1.5),
        boxSizing: 'border-box',
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
    nftImg: {
        maxWidth: '100%',
    },
    nftNameWrapper: {
        width: '100%',
        background: theme.palette.background.paper,
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
    cancelButton: {},
    sendButton: {},
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
    loadingFailImage: {
        minHeight: '0px !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
    iframe: {
        minHeight: 147,
    },
    ellipsis: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
}))
export interface RedpacketNftConfirmDialogProps {
    open: boolean
    onBack: () => void
    onClose: () => void
    contract: ERC721ContractDetailed
    tokenList: ERC721TokenDetailed[]
    message: string
}
export function RedpacketNftConfirmDialog(props: RedpacketNftConfirmDialogProps) {
    const { classes } = useStyles()
    const { open, onBack, onClose, message, contract, tokenList } = props
    const wallet = useWallet()
    const account = useAccount()
    const chainId = useChainId()
    const web3 = useWeb3()
    const { attachMetadata } = useCompositionContext()

    const { t } = useI18N()
    const { address: publicKey, privateKey } = useMemo(() => web3.eth.accounts.create(), [])
    const duration = 60 * 60 * 24
    const currentIdentity = useCurrentIdentity()
    const senderName = currentIdentity?.identifier.userId ?? currentIdentity?.linkedPersona?.nickname ?? 'Unknown User'
    const tokenIdList = tokenList.map((value) => value.tokenId)
    const [createState, createCallback, resetCallback] = useCreateNftRedpacketCallback(
        duration,
        message,
        senderName,
        contract.address,
        tokenIdList,
    )
    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    const isSending = [TransactionStateType.WAIT_FOR_CONFIRMING, TransactionStateType.HASH].includes(createState.type)
    const onSendTx = useCallback(() => createCallback(publicKey), [publicKey])
    const [txid, setTxid] = useState('')
    const onSendPost = useCallback(
        (id: string) => {
            attachMetadata(RedPacketNftMetaKey, {
                id,
                txid,
                duration,
                message,
                senderName,
                contractName: contract.name,
                contractAddress: contract.address,
                contractTokenURI: contract.iconURL ?? '',
                contractVersion: 1,
                privateKey,
                chainId: contract.chainId,
            })
            closeWalletStatusDialog()
        },
        [duration, message, senderName, contract, privateKey, txid],
    )
    useEffect(() => {
        if (createState.type === TransactionStateType.HASH && createState.hash) {
            setTxid(createState.hash)
            RedPacketRPC.addRedPacketNft({ id: createState.hash, password: privateKey, contract_version: 1 })
        }

        if (![TransactionStateType.CONFIRMED, TransactionStateType.FAILED].includes(createState.type)) {
            return
        }

        if (createState.type === TransactionStateType.CONFIRMED && createState.no === 0) {
            const { receipt } = createState

            const { id } = (receipt.events?.CreationSuccess.returnValues ?? {}) as {
                id: string
            }
            onSendPost(id)
            onClose()
        }

        resetCallback()
    }, [createState, onSendPost])

    return (
        <InjectedDialog open={open} onClose={onBack} title={t('confirm')} maxWidth="xs">
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
                            {isNativeTokenAddress(wallet) ? null : (
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
                            {t('plugin_red_packet_nft_attached_message')}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="body1"
                            color="textPrimary"
                            align="right"
                            className={(classes.text, classes.bold, classes.ellipsis)}>
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
                                <div key={i}>
                                    <NFTCard token={value} renderOrder={i} />
                                </div>
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
                            onClick={onBack}
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
                                loading={isSending}
                                disabled={isSending}
                                onClick={onSendTx}
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

interface NFTCardProps {
    token: ERC721TokenDetailed
    renderOrder: number
}

function NFTCard(props: NFTCardProps) {
    const { token, renderOrder } = props
    const { classes } = useStyles()
    const [name, setName] = useState(formatNFT_TokenId(token.tokenId, 2))
    return (
        <ListItem className={classNames(classes.tokenSelectorWrapper)}>
            <NFTCardStyledAssetPlayer
                contractAddress={token.contractDetailed.address}
                chainId={token.contractDetailed.chainId}
                tokenId={token.tokenId}
                renderOrder={renderOrder}
                setERC721TokenName={setName}
                classes={{
                    loadingFailImage: classes.loadingFailImage,
                    iframe: classes.iframe,
                }}
            />

            <div className={classes.nftNameWrapper}>
                <Typography className={classes.nftName} color="textSecondary">
                    {name}
                </Typography>
            </div>
        </ListItem>
    )
}
