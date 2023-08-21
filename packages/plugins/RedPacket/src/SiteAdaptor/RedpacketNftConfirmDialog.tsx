import { useMemo, useCallback, useState, memo } from 'react'
import { makeStyles, ActionButton } from '@masknet/theme'
import {
    formatEthereumAddress,
    type ChainId,
    type SchemaType,
    isNativeTokenAddress,
    formatTokenId,
    type GasConfig,
} from '@masknet/web3-shared-evm'
import {
    AssetPreviewer,
    PluginWalletStatusBar,
    ChainBoundary,
    WalletConnectedBoundary,
    ApplicationBoardModal,
} from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import type { NonFungibleToken, NonFungibleCollection } from '@masknet/web3-shared-base'
import { Grid, Link, Typography, List, DialogContent, ListItem, Box } from '@mui/material'
import { ExplorerResolver, Web3 } from '@masknet/web3-providers'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { useI18N } from '../locales/index.js'
import { useCreateNftRedpacketCallback } from './hooks/useCreateNftRedpacketCallback.js'
import { RedPacketNftMetaKey } from '../constants.js'
import { RedPacketRPC } from '../messages.js'
import { openComposition } from './openComposition.js'

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
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    tokenSelectorWrapper: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        padding: 0,
        background: theme.palette.mode === 'light' ? '#fff' : '#2F3336',
        height: 150,
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
        width: 64,
        height: 64,
    },
    ellipsis: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    assetImgWrapper: {
        maxHeight: 120,
        overflow: 'hidden',
    },
}))

interface NFTCardProps {
    token: NonFungibleToken<ChainId, SchemaType>
}

const NFTCard = memo(function NFTCard(props: NFTCardProps) {
    const { token } = props
    const { classes } = useStyles()
    return (
        <ListItem className={classes.tokenSelectorWrapper}>
            <AssetPreviewer
                url={token.metadata?.mediaURL || token.metadata?.imageURL}
                classes={{
                    fallbackImage: classes.fallbackImage,
                    root: classes.assetImgWrapper,
                }}
            />
            <div className={classes.nftNameWrapper}>
                <Typography className={classes.nftName} color="textSecondary">
                    {formatTokenId(token.tokenId, 2)}
                </Typography>
            </div>
        </ListItem>
    )
})
export interface RedpacketNftConfirmDialogProps {
    onBack: () => void
    onClose: () => void
    contract: NonFungibleCollection<ChainId, SchemaType>
    tokenList: Array<NonFungibleToken<ChainId, SchemaType>>
    message: string
    senderName: string
    gasOption?: GasConfig
}
export function RedpacketNftConfirmDialog(props: RedpacketNftConfirmDialogProps) {
    const t = useI18N()
    const { classes, cx } = useStyles()
    const { onClose, message, contract, tokenList, senderName, gasOption } = props
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { account: publicKey, privateKey = '' } = useMemo(() => Web3.createAccount(), [])!

    const duration = 60 * 60 * 24

    const tokenIdList = tokenList.map((value) => value.tokenId)
    const [{ loading: isSending }, createCallback] = useCreateNftRedpacketCallback(
        duration,
        message,
        senderName,
        contract.address ?? '',
        tokenIdList,
        gasOption,
    )

    const [transactionId, setTransactionId] = useState('')

    const onSendTx = useCallback(async () => {
        const result = await createCallback(publicKey)

        const { hash, receipt, events } = result ?? {}
        if (typeof hash !== 'string') return
        if (typeof receipt?.transactionHash !== 'string') return
        setTransactionId(receipt.transactionHash)
        RedPacketRPC.addRedPacketNft({ id: receipt.transactionHash, password: privateKey, contract_version: 1 })
        const { id } = (events?.CreationSuccess?.returnValues ?? {}) as {
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
            ApplicationBoardModal.close()
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
                                href={ExplorerResolver.addressLink(chainId, account)}
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
                <Grid item xs={12} component={List} className={classes.tokenSelector}>
                    {tokenList.map((value, i) => (
                        <NFTCard key={i} token={value} />
                    ))}
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
