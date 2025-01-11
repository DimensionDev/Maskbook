import { Trans } from '@lingui/react/macro'
import {
    ApplicationBoardModal,
    AssetPreviewer,
    ChainBoundary,
    PluginWalletStatusBar,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID, RedPacketNftMetaKey } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useWallet } from '@masknet/web3-hooks-base'
import { EVMExplorerResolver, EVMWeb3 } from '@masknet/web3-providers'
import type { NonFungibleToken } from '@masknet/web3-shared-base'
import {
    formatEthereumAddress,
    formatTokenId,
    isNativeTokenAddress,
    type ChainId,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { Box, Link, ListItem, Typography } from '@mui/material'
import { memo, useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { RedPacketRPC } from '../../messages.js'
import { useCreateNftRedpacketCallback } from '../hooks/useCreateNftRedpacketCallback.js'
import { openComposition } from '../openComposition.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { CompositionTypeContext } from '../contexts/CompositionTypeContext.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
    },
    settings: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        flexGrow: 1,
    },
    field: {
        display: 'flex',
    },
    fieldName: {
        fontSize: 14,
        fontWeight: 700,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    fieldValue: {
        marginLeft: 'auto',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
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
    icon: {
        marginRight: 8,
        height: 24,
        width: 24,
    },
    tokenSelector: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: theme.spacing(1),
        width: '100%',
        maxHeight: 420,
        overflowY: 'auto',
        background: theme.palette.background.default,
        borderRadius: 12,
        padding: theme.spacing(1),
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
export function NftRedPacketConfirm() {
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const { nftGasOption: gasOption, creator, message, collection, selectedNfts: tokenList } = useRedPacket()
    const wallet = useWallet()
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { account: redpacketPubkey, privateKey = '' } = useMemo(() => EVMWeb3.createAccount(), [])!

    const duration = 60 * 60 * 24

    const tokenIdList = useMemo(() => tokenList.map((value) => value.tokenId), [tokenList])
    const [{ loading: isSending }, createCallback] = useCreateNftRedpacketCallback(
        duration,
        message,
        creator,
        collection?.address ?? '',
        tokenIdList,
        gasOption,
    )

    const [transactionId, setTransactionId] = useState('')

    const onSendTx = useCallback(async () => {
        const result = await createCallback(redpacketPubkey)

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
        navigate(RoutePaths.Exit)
    }, [redpacketPubkey, createCallback, privateKey])

    const compositionType = useContext(CompositionTypeContext)
    const onSendPost = useCallback(
        (id: string) => {
            openComposition(
                RedPacketNftMetaKey,
                {
                    id,
                    transactionId,
                    duration,
                    message,
                    senderName: creator,
                    contractName: collection?.name,
                    contractAddress: collection?.address,
                    contractTokenURI: collection?.iconURL ?? '',
                    contractVersion: 1,
                    privateKey,
                    chainId: collection?.chainId,
                },
                compositionType,
            )
            ApplicationBoardModal.close()
        },
        [duration, message, creator, collection, privateKey, transactionId, compositionType],
    )

    return (
        <div className={classes.container}>
            <div className={classes.settings}>
                <div className={classes.field}>
                    <Typography color="textPrimary" variant="body1" className={classes.fieldName}>
                        <Trans>Wallet account</Trans>
                    </Typography>
                    <div className={classes.fieldValue}>
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
                                    href={EVMExplorerResolver.addressLink(chainId, account)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={stop}>
                                    <LaunchIcon fontSize="small" />
                                </Link>
                            )}
                        </Typography>
                    </div>
                </div>
                <div className={classes.field}>
                    <Typography variant="body1" color="textPrimary" className={classes.fieldName}>
                        <Trans>Attached Message</Trans>
                    </Typography>
                    <Typography
                        variant="body1"
                        color="textPrimary"
                        align="right"
                        className={cx(classes.text, classes.bold, classes.ellipsis, classes.fieldValue)}>
                        {message}
                    </Typography>
                </div>
                <div className={classes.field}>
                    <Typography variant="body1" color="textPrimary" className={classes.fieldName}>
                        <Trans>Collections</Trans>
                    </Typography>
                    <div className={classes.fieldValue}>
                        {collection?.iconURL ?
                            <img className={classes.icon} src={collection.iconURL} />
                        :   null}
                        <Typography
                            variant="body1"
                            color="textPrimary"
                            align="right"
                            className={cx(classes.text, classes.bold)}>
                            {collection?.name}
                        </Typography>
                    </div>
                </div>
                <div className={classes.tokenSelector}>
                    {tokenList.map((value, i) => (
                        <NFTCard key={i} token={value} />
                    ))}
                </div>

                <div className={classes.field}>
                    <Typography color="textPrimary" variant="body1" className={classes.fieldName}>
                        <Trans>Total Amount</Trans>
                    </Typography>
                    <Typography
                        color="textPrimary"
                        align="right"
                        className={cx(classes.text, classes.bold, classes.fieldValue)}>
                        {tokenList.length}
                    </Typography>
                </div>
            </div>
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
                                {isSending ?
                                    <Trans>Confirming</Trans>
                                :   <Trans>Confirm</Trans>}
                            </ActionButton>
                        </WalletConnectedBoundary>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </Box>
        </div>
    )
}
