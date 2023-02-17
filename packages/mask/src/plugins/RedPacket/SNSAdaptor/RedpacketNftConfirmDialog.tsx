import { useMemo, useCallback, useState } from 'react'
import { useAsync } from 'react-use'
import { makeStyles, ActionButton } from '@masknet/theme'
import {
    formatEthereumAddress,
    explorerResolver,
    ChainId,
    SchemaType,
    isNativeTokenAddress,
    formatTokenId,
} from '@masknet/web3-shared-evm'
import {
    NFTCardStyledAssetPlayer,
    PluginWalletStatusBar,
    ChainBoundary,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWallet, useWeb3 } from '@masknet/web3-hooks-base'
import type { NonFungibleToken, NonFungibleCollection } from '@masknet/web3-shared-base'
import { Grid, Link, Typography, List, DialogContent, ListItem, Box } from '@mui/material'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { useI18N } from '../locales/index.js'
import { useCreateNftRedpacketCallback } from './hooks/useCreateNftRedpacketCallback.js'
import { useCurrentIdentity, useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI.js'
import { RedPacketNftMetaKey } from '../constants.js'
import { RedPacketRPC } from '../messages.js'
import { WalletMessages } from '../../Wallet/messages.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { openComposition } from './openComposition.js'
import Services from '../../../extension/service.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontSize: 16,
        height: 700,
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
    nftNameWrapper: {
        position: 'absolute',
        bottom: 0,
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
    button: {
        minHeight: 36,
        height: 36,
    },
    sendButton: {},
    fallbackImage: {
        minHeight: '0 !important',
        maxWidth: 'none',
        transform: 'translateY(10px)',
        width: 64,
        height: 64,
    },
    ellipsis: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    assetImgWrapper: {
        maxHeight: 155,
        overflow: 'hidden',
    },
}))
export interface RedpacketNftConfirmDialogProps {
    onBack: () => void
    onClose: () => void
    contract: NonFungibleCollection<ChainId, SchemaType>
    tokenList: Array<NonFungibleToken<ChainId, SchemaType>>
    message: string
}
export function RedpacketNftConfirmDialog(props: RedpacketNftConfirmDialogProps) {
    const { classes, cx } = useStyles()
    const { onClose, message, contract, tokenList } = props
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const web3 = useWeb3(NetworkPluginID.PLUGIN_EVM)

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
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.applicationDialogUpdated,
    )
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
        contract.address ?? '',
        tokenIdList,
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
            openComposition(RedPacketNftMetaKey, {
                id,
                transactionId,
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
            closeApplicationBoardDialog()
        },
        [duration, message, senderName, contract, privateKey, transactionId],
    )

    return (
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
                        className={cx(classes.account, classes.bold, classes.text)}>
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
                    <Typography variant="body1" color="textPrimary" className={cx(classes.text)}>
                        {t.nft_attached_message()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography
                        variant="body1"
                        color="textPrimary"
                        align="right"
                        className={cx(classes.text, classes.bold, classes.ellipsis)}>
                        {message}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="body1" color="textPrimary" className={cx(classes.text)}>
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
                            className={cx(classes.text, classes.bold)}>
                            {contract.name}
                        </Typography>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <List className={classes.tokenSelector}>
                        {tokenList.map((value, i) => (
                            <div key={i}>
                                <NFTCard token={value} />
                            </div>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={6}>
                    <Typography color="textPrimary" variant="body1" className={cx(classes.text)}>
                        {t.nft_total_amount()}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography color="textPrimary" align="right" className={cx(classes.text, classes.bold)}>
                        {tokenList.length}
                    </Typography>
                </Grid>
            </Grid>
            <Box style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
                <PluginWalletStatusBar>
                    <ChainBoundary expectedPluginID={NetworkPluginID.PLUGIN_EVM} expectedChainId={chainId}>
                        <WalletConnectedBoundary
                            expectedChainId={chainId}
                            classes={{
                                connectWallet: cx(classes.button, classes.sendButton),
                            }}>
                            <ActionButton
                                size="medium"
                                loading={isSending}
                                disabled={isSending}
                                onClick={onSendTx}
                                className={cx(classes.button, classes.sendButton)}
                                fullWidth>
                                {t.send_symbol({
                                    count: tokenList.length,
                                })}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </Box>
        </DialogContent>
    )
}

interface NFTCardProps {
    token: NonFungibleToken<ChainId, SchemaType>
}

function NFTCard(props: NFTCardProps) {
    const { token } = props
    const { classes, cx } = useStyles()
    return (
        <ListItem className={cx(classes.tokenSelectorWrapper)}>
            <NFTCardStyledAssetPlayer
                contractAddress={token.contract?.address}
                chainId={token.contract?.chainId}
                url={token.metadata?.mediaURL || token.metadata?.imageURL}
                tokenId={token.tokenId}
                classes={{
                    fallbackImage: classes.fallbackImage,
                    imgWrapper: classes.assetImgWrapper,
                }}
                disableQueryNonFungibleAsset
            />
            <div className={classes.nftNameWrapper}>
                <Typography className={classes.nftName} color="textSecondary">
                    {formatTokenId(token.tokenId, 2)}
                </Typography>
            </div>
        </ListItem>
    )
}
