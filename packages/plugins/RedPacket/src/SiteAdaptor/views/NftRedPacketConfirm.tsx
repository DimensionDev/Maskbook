import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import {
    ApplicationBoardModal,
    ChainBoundary,
    PluginWalletStatusBar,
    SelectGasSettingsToolbar,
    WalletConnectedBoundary,
} from '@masknet/shared'
import { NetworkPluginID, RedPacketNftMetaKey } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useNativeTokenPrice, useSmartPayChainId, useWallet } from '@masknet/web3-hooks-base'
import { EVMChainResolver, EVMExplorerResolver, EVMWeb3 } from '@masknet/web3-providers'
import { Box, Link, Typography } from '@mui/material'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoutePaths } from '../../constants.js'
import { RedPacketRPC } from '../../messages.js'
import { NFTCard } from '../components/NFTCard.js'
import { CompositionTypeContext } from '../contexts/CompositionTypeContext.js'
import { useRedPacket } from '../contexts/RedPacketContext.js'
import { useCreateNftRedpacketCallback } from '../hooks/useCreateNftRedpacketCallback.js'
import { openComposition } from '../openComposition.js'
import { PreviewNftRedPacket } from '../components/PreviewNftRedPacket.js'
import { isZero } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        paddingBottom: 70,
    },
    settings: {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        flexGrow: 1,
    },
    message: {
        fontSize: 24,
        fontWeight: 700,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 2,
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
    envelope: {
        width: 484,
        height: 336,
        borderRadius: theme.spacing(2),
        overflow: 'hidden',
    },
    button: {
        minHeight: 36,
        height: 36,
    },
    sendButton: {},
    assets: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))',
        gap: 10,
    },
    card: {
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: theme.palette.maskColor.input,
    },
}))

export function NftRedPacketConfirm() {
    const { classes, cx } = useStyles()
    const navigate = useNavigate()
    const {
        nftGasOption: gasOption,
        creator,
        settings,
        message,
        collection,
        selectedNfts,
        theme,
        setGasOption,
    } = useRedPacket()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const nativeTokenDetailed = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId])
    const { data: nativeTokenPrice = 0 } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const wallet = useWallet()
    const { account: redpacketPubkey, privateKey = '' } = useMemo(() => EVMWeb3.createAccount(), [])!
    const smartPayChainId = useSmartPayChainId()

    const duration = 60 * 60 * 24

    const tokenIds = useMemo(() => selectedNfts.map((value) => value.tokenId), [selectedNfts])
    const {
        loading: isSending,
        gasLimit,
        estimateGasFee,
        createCallback,
    } = useCreateNftRedpacketCallback({
        publicKey: redpacketPubkey,
        duration,
        message,
        creator,
        contractAddress: collection?.address ?? '',
        tokenIds,
        gasOption,
    })

    const [transactionId, setTransactionId] = useState('')

    const onSendTx = useCallback(async () => {
        const result = await createCallback()

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
    const themeId = theme?.tid

    const post = t`Hi friends, I just created an NFT Lucky Drop on Twitter through Mask Network extension. Feel free to claim and share. Follow @realMaskNetwork  for Web3 updates and insights.

🧧🧧🧧 Try sending Lucky Drop to your friends with Mask.io.`
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
                    themeId,
                },
                compositionType,
                undefined,
                post,
            )
            ApplicationBoardModal.close()
        },
        [duration, message, creator, collection, privateKey, transactionId, compositionType, themeId, post],
    )

    return (
        <div className={classes.container}>
            <div className={classes.settings}>
                <Typography variant="h4" color="textPrimary" align="center" className={classes.message}>
                    {settings.message}
                </Typography>
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Collection</Trans>
                    </Typography>
                    <Typography variant="body1" className={classes.fieldValue}>
                        {collection?.name}
                        {collection?.address ?
                            <Link
                                color="textPrimary"
                                className={classes.link}
                                href={EVMExplorerResolver.addressLink(chainId, collection.address)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stop}>
                                <Icons.LinkOut size={20} />
                            </Link>
                        :   null}
                    </Typography>
                </div>
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Total NFTs</Trans>
                    </Typography>
                    <Typography variant="body1" className={classes.fieldValue}>
                        {selectedNfts.length}
                    </Typography>
                </div>
                <div className={classes.assets}>
                    {selectedNfts.map((nft) => (
                        <NFTCard key={nft.tokenId} token={nft} className={classes.card} />
                    ))}
                </div>
                {estimateGasFee && !isZero(estimateGasFee) ?
                    <div className={classes.field}>
                        <Typography className={classes.fieldName}>
                            <Trans>Transaction cost</Trans>
                        </Typography>
                        <SelectGasSettingsToolbar
                            className={classes.fieldValue}
                            nativeToken={nativeTokenDetailed}
                            nativeTokenPrice={nativeTokenPrice}
                            supportMultiCurrency={!!wallet?.owner && chainId === smartPayChainId}
                            gasConfig={gasOption}
                            gasLimit={gasLimit ?? 0}
                            onChange={setGasOption}
                            estimateGasFee={estimateGasFee}
                            editMode
                        />
                    </div>
                :   null}
                <div className={classes.field}>
                    <Typography className={classes.fieldName}>
                        <Trans>Cover</Trans>
                    </Typography>
                    <div className={classes.fieldValue}>
                        <PreviewNftRedPacket
                            className={classes.envelope}
                            message={message}
                            creator={creator}
                            totalShares={selectedNfts.length}
                            asset={selectedNfts[0]}
                            theme={theme}
                        />
                    </div>
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
