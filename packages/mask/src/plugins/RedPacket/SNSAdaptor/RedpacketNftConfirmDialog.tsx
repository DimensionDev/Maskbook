import { useMemo, useCallback, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import {
    formatEthereumAddress,
    explorerResolver,
    ChainId,
    SchemaType,
    isNativeTokenAddress,
    formatTokenId,
} from '@masknet/web3-shared-evm'
import { InjectedDialog, NFTCardStyledAssetPlayer } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import classNames from 'classnames'
import { Grid, Link, Typography, DialogContent, List, ListItem } from '@mui/material'
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import LaunchIcon from '@mui/icons-material/Launch'
import { PluginWalletStatusBar, useI18N as useBaseI18N } from '../../../utils'
import { useI18N } from '../locales'
import { useCreateNftRedpacketCallback } from './hooks/useCreateNftRedpacketCallback'
import { useCurrentIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useCompositionContext } from '@masknet/plugin-infra/content-script'
import { RedPacketNftMetaKey } from '../constants'
import { WalletMessages } from '../../Wallet/messages'
import { RedPacketRPC } from '../messages'
import { useAccount, useChainId, useWallet, useWeb3 } from '@masknet/plugin-infra/web3'
import { NetworkPluginID, NonFungibleTokenContract, NonFungibleToken } from '@masknet/web3-shared-base'
import { useAsync } from 'react-use'
import Services from '../../../extension/service'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary'

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
        marginTop: 0,
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
        minHeight: '0 !important',
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
    contract: NonFungibleTokenContract<ChainId, SchemaType.ERC721>
    tokenList: Array<NonFungibleToken<ChainId, SchemaType.ERC721>>
    message: string
}
export function RedpacketNftConfirmDialog(props: RedpacketNftConfirmDialogProps) {
    const { classes } = useStyles()
    const { open, onBack, onClose, message, contract, tokenList } = props
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)
    const { attachMetadata } = useCompositionContext()

    const { t: i18n } = useBaseI18N()
    const t = useI18N()
    const { address: publicKey, privateKey } = useMemo(
        () => web3?.eth.accounts.create() ?? { address: '', privateKey: '' },
        [web3],
    )!
    const duration = 60 * 60 * 24
    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useAsync(async () => {
        if (!currentIdentity?.linkedPersona) return
        return Services.Identity.queryPersona(currentIdentity.linkedPersona)
    }, [currentIdentity?.linkedPersona])

    const lastRecognized = useLastRecognizedIdentity()
    const senderName =
        lastRecognized.identifier?.userId ??
        currentIdentity?.identifier.userId ??
        linkedPersona?.nickname ??
        'Unknown User'
    const tokenIdList = tokenList.map((value) => value.tokenId)
    const [{ loading: isSending }, createCallback] = useCreateNftRedpacketCallback(
        duration,
        message,
        senderName,
        contract.address,
        tokenIdList,
    )
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    const [transactionId, setTransactionId] = useState('')

    const onSendTx = useCallback(async () => {
        const result = await createCallback(publicKey)

        const { hash, receipt, events } = result ?? {}
        if (typeof hash !== 'string') return
        if (typeof receipt?.transactionHash !== 'string') return
        setTransactionId(receipt.transactionHash)
        RedPacketRPC.addRedPacketNft({ id: receipt.transactionHash, password: privateKey, contract_version: 1 })
        const { id } = (events?.CreationSuccess.returnValues ?? {}) as {
            id?: string
        }
        if (!id) return
        onSendPost(id)
        onClose()
    }, [publicKey])

    const onSendPost = useCallback(
        (id: string) => {
            attachMetadata(RedPacketNftMetaKey, {
                id,
                transactionId,
                duration,
                message,
                senderName,
                contractName: contract.name,
                contractAddress: contract.address,
                contractTokenURI: contract.logoURL ?? '',
                contractVersion: 1,
                privateKey,
                chainId: contract.chainId,
            })
            closeApplicationBoardDialog()
        },
        [duration, message, senderName, contract, privateKey, transactionId],
    )

    return (
        <InjectedDialog open={open} onClose={onBack} title={i18n('confirm')} maxWidth="xs">
            <DialogContent className={classes.root}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography color="textPrimary" variant="body1" className={classes.text}>
                            {t.nft_account_name()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            color="textPrimary"
                            variant="body1"
                            align="right"
                            className={classNames(classes.account, classes.bold, classes.text)}>
                            {formatEthereumAddress(account, 4)}
                            {isNativeTokenAddress(wallet?.address) ? null : (
                                <Link
                                    color="textPrimary"
                                    className={classes.link}
                                    href={explorerResolver.addressLink(chainId, account)}
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
                            {t.nft_attached_message()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="body1"
                            color="textPrimary"
                            align="right"
                            className={classNames(classes.text, classes.bold, classes.ellipsis)}>
                            {message}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1" color="textPrimary" className={classNames(classes.text)}>
                            {t.collections()}
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
                            {t.nft_total_amount()}
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
                <PluginWalletStatusBar>
                    <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                        <WalletConnectedBoundary
                            classes={{
                                connectWallet: classNames(classes.button, classes.sendButton),
                                unlockMetaMask: classNames(classes.button, classes.sendButton),
                            }}>
                            <ActionButton
                                size="medium"
                                loading={isSending}
                                disabled={isSending}
                                onClick={onSendTx}
                                className={classNames(classes.button, classes.sendButton)}
                                fullWidth>
                                {t.send_symbol({
                                    amount: tokenList.length.toString(),
                                    symbol: tokenList.length > 1 ? 'NFTs' : 'NFT',
                                })}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </DialogContent>
        </InjectedDialog>
    )
}

interface NFTCardProps {
    token: NonFungibleToken<ChainId, SchemaType.ERC721>
    renderOrder: number
}

function NFTCard(props: NFTCardProps) {
    const { token, renderOrder } = props
    const { classes } = useStyles()
    const [name, setName] = useState(formatTokenId(token.tokenId, 2))
    return (
        <ListItem className={classNames(classes.tokenSelectorWrapper)}>
            <NFTCardStyledAssetPlayer
                contractAddress={token.contract?.address}
                chainId={token.contract?.chainId}
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
