import { Drop2Icon, LinkOutIcon, SuccessIcon } from '@masknet/icons'
import { PluginId, useActivatedPlugin } from '@masknet/plugin-infra/dom'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNetworkDescriptor,
    useNonFungibleToken,
    useProviderDescriptor,
    useReverseAddress,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { InjectedDialog, NFTCardStyledAssetPlayer, WalletIcon } from '@masknet/shared'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { ChainId, SchemaType, TransactionStateType } from '@masknet/web3-shared-evm'
import { DialogContent, Link, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo } from 'react'
import { useBoolean } from 'react-use'
import { hasNativeAPI, nativeAPI } from '../../../../shared/native-rpc'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { activatedSocialNetworkUI } from '../../../social-network'
import { WalletMessages } from '../../Wallet/messages'
import { TargetChainIdContext, useTip } from '../contexts'
import { useI18N } from '../locales'
import { TipType } from '../types'
import { ConfirmModal } from './common/ConfirmModal'
import { AddDialog } from './AddDialog'
import { TipForm } from './TipForm'
import { NetworkPluginID } from '@masknet/public-api'
import type { NonFungibleToken } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        width: 600,
        backgroundImage: 'none',
    },
    dialogTitle: {
        height: 60,
        paddingTop: '0 !important',
        paddingBottom: '0 !important',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '100%',
        paddingTop: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        flexShrink: 0,
    },
    tab: {
        height: 36,
        minHeight: 36,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
    },
    tipForm: {
        flexGrow: 1,
        overflow: 'auto',
    },
    nftContainer: {
        height: 100,
        width: 100,
    },
    nftMessage: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    nftMessageText: {
        fontSize: 18,
        color: '#3DC233',
        marginTop: theme.spacing(3),
        lineHeight: '30px',
    },
    loadingFailImage: {
        width: 64,
        height: 64,
    },
    walletChip: {
        marginLeft: 'auto',
        height: 40,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(0.5, 1),
        borderRadius: 99,
    },
    wallet: {
        marginLeft: theme.spacing(1),
    },
    walletTitle: {
        marginLeft: theme.spacing(1),
        lineHeight: '18px',
        height: 18,
        fontSize: 14,
        fontWeight: 'bold',
    },
    walletAddress: {
        height: 12,
        display: 'flex',
        alignItems: 'center',
        fontSize: 10,
        color: theme.palette.text.secondary,
    },
    changeWalletButton: {
        marginLeft: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    link: {
        cursor: 'pointer',
        lineHeight: '10px',
        marginTop: 2,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    linkIcon: {
        fill: 'none',
        width: 12,
        height: 12,
        marginLeft: theme.spacing(0.5),
    },
}))

interface TipDialogProps {
    open?: boolean
    onClose?: () => void
}

export function TipDialog({ open = false, onClose }: TipDialogProps) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    const tipDefinition = useActivatedPlugin(PluginId.NextID, 'any')
    const chainIdList = tipDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST
    const t = useI18N()
    const { classes } = useStyles()

    const [addTokenDialogIsOpen, openAddTokenDialog] = useBoolean(false)
    const [confirmModalIsOpen, openConfirmModal] = useBoolean(false)
    const { targetChainId, setTargetChainId } = TargetChainIdContext.useContainer()
    const {
        tipType,
        amount,
        token,
        recipientSnsId,
        recipient,
        sendState,
        erc721Contract,
        erc721TokenId,
        setErc721Address,
        setErc721TokenId,
        reset,
    } = useTip()

    const isTokenTip = tipType === TipType.Token
    const shareText = useMemo(() => {
        const promote = t.tip_mask_promote()
        const message = isTokenTip
            ? t.tip_token_share_post({
                  amount,
                  symbol: token?.symbol || 'token',
                  recipientSnsId,
                  recipient,
                  promote,
              })
            : t.tip_nft_share_post({
                  name: erc721Contract?.name || 'NFT',
                  recipientSnsId,
                  recipient,
                  promote,
              })
        return message
    }, [amount, isTokenTip, erc721Contract?.name, token, recipient, recipientSnsId, t])

    const { value: erc721Token } = useNonFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        erc721Contract?.address,
        erc721TokenId ?? '',
    )

    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const successMessage = useMemo(() => {
        if (isTokenTip) return t.send_tip_successfully()
        if (erc721Token)
            return (
                <div className={classes.nftMessage}>
                    <div className={classes.nftContainer}>
                        <NFTCardStyledAssetPlayer
                            chainId={chainId}
                            contractAddress={erc721Token.address}
                            url={erc721Token.metadata?.mediaURL}
                            tokenId={erc721Token.tokenId}
                            classes={{
                                loadingFailImage: classes.loadingFailImage,
                            }}
                        />
                    </div>
                    <Typography className={classes.nftMessageText}>
                        {t.send_specific_tip_successfully({
                            amount: '1',
                            name: erc721Token.contract?.name || 'NFT',
                        })}
                    </Typography>
                </div>
            )
        return t.send_tip_successfully()
    }, [t, isTokenTip, classes.nftMessage, erc721Token])

    useEffect(() => {
        if (sendState.type !== TransactionStateType.CONFIRMED) return
        openConfirmModal(true)
    }, [sendState.type])

    const handleConfirm = useCallback(() => {
        activatedSocialNetworkUI.utils.share?.(shareText)
        openConfirmModal(false)
        onClose?.()
    }, [shareText, onClose])
    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()

    const { Others } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, account)
    const walletTitle =
        Others?.formatDomainName?.(domain) || Others?.formatAddress?.(account, 4) || providerDescriptor?.name

    // #region change provider
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion
    const openWallet = useCallback(() => {
        if (hasNativeAPI) return nativeAPI?.api.misc_openCreateWalletView()
        return openSelectProviderDialog()
    }, [openSelectProviderDialog, hasNativeAPI])

    const handleAddToken = useCallback((token: NonFungibleToken<ChainId, SchemaType>) => {
        setErc721Address(token.address ?? '')
        setErc721TokenId(token.tokenId)
        openAddTokenDialog(false)
    }, [])

    const walletChip = account ? (
        <div className={classes.walletChip}>
            <WalletIcon
                size={30}
                badgeSize={12}
                networkIcon={providerDescriptor?.icon}
                providerIcon={networkDescriptor?.icon}
            />
            <div className={classes.wallet}>
                <Typography ml={1} className={classes.walletTitle}>
                    {walletTitle}
                </Typography>

                <Typography ml={1} className={classes.walletAddress}>
                    {Others?.formatAddress?.(account, 4)}
                    <Link
                        className={classes.link}
                        href={account ? Others?.explorerResolver.addressLink(chainId, account) ?? '' : ''}
                        target="_blank"
                        rel="noopener noreferrer">
                        <LinkOutIcon className={classes.linkIcon} />
                    </Link>
                </Typography>
            </div>
            <div className={classes.changeWalletButton} role="button" onClick={openWallet}>
                <Drop2Icon />
            </div>
        </div>
    ) : null

    return (
        <>
            <InjectedDialog
                open={open}
                onClose={onClose}
                classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialog }}
                title={t.tips()}
                titleTail={walletChip}>
                <DialogContent className={classes.content}>
                    <div className={classes.abstractTabWrapper}>
                        <NetworkTab
                            classes={classes}
                            chainId={targetChainId}
                            setChainId={setTargetChainId}
                            chains={chainIdList}
                        />
                    </div>
                    <TipForm className={classes.tipForm} onAddToken={() => openAddTokenDialog(true)} />
                </DialogContent>
            </InjectedDialog>
            <ConfirmModal
                title={t.tips()}
                open={confirmModalIsOpen}
                onClose={() => {
                    openConfirmModal(false)
                    reset()
                    onClose?.()
                }}
                icon={isTokenTip ? <SuccessIcon style={{ height: 64, width: 64 }} /> : null}
                message={successMessage}
                confirmText={t.tip_share()}
                onConfirm={handleConfirm}
            />
            <AddDialog open={addTokenDialogIsOpen} onClose={() => openAddTokenDialog(false)} onAdd={handleAddToken} />
        </>
    )
}
