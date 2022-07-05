import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { ChainId, networkResolver, NetworkType } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    Divider,
    ListItemIcon,
    MenuItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import { BindingProof, EMPTY_LIST, PopupRoutes } from '@masknet/shared-base'
import type { AllChainsNonFungibleToken, SelectTokenInfo } from '../types'
import { uniqBy } from 'lodash-unified'
import { Translate, useI18N } from '../locales'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNonFungibleAssets,
    useWallet,
} from '@masknet/plugin-infra/web3'
import { NFTWalletConnect } from './WalletConnect'
import { toPNG } from '../utils'
import { NFTListPage } from './NFTListPage'
import { useSubscription } from 'use-subscription'
import { context } from '../context'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { useAsync } from 'react-use'
import { WalletMessages, WalletRPC } from '../../Wallet/messages'
import { PluginWalletStatusBar, useMenu } from '../../../utils'
import { WalletItem } from './WalletList'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import Services from '../../../extension/service'
import { WalletSettingIcon } from '../assets/setting'
import { Verify2Icon } from '../assets/Verify2'

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 10,
        right: 10,
    },

    button: {
        width: 219.5,
        borderRadius: 999,
    },
    AddCollectiblesButton: {
        fontWeight: 600,
        color: '#1D9BF0',
    },
    actions: {
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        padding: 0,
        display: 'block',
        margin: 0,
        '&>:not(:first-of-type)': {
            margin: 0,
        },
    },
    content: {
        height: 612,
        padding: 0,
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
        marginBottom: 72,
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        paddingTop: 260,
    },
    skeleton: {
        width: 97,
        height: 97,
        objectFit: 'cover',
        borderRadius: '100%',
        boxSizing: 'border-box',
        padding: 6,
        margin: theme.spacing(0.5, 1),
    },
    skeletonBox: {
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    gallery: {
        display: 'flex',
        flexFlow: 'row wrap',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },

    abstractTabWrapper: {
        width: '100%',
        flex: 1,
        flexShrink: 0,
        position: 'absolute',
    },
    tableTabWrapper: {
        padding: theme.spacing(2),
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
        paddingLeft: 16,
        paddingRight: 16,
        borderRadius: 4,
        '& .Mui-selected': {
            color: '#ffffff',
            backgroundColor: `${theme.palette.primary.main}!important`,
        },
    },
    indicator: {
        display: 'none',
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    divider: {
        borderColor: theme.palette.mode === 'dark' ? '#2F3336' : '#F2F5F6',
        marginLeft: 16,
        marginRight: 16,
    },
}))

function isSameToken(token?: AllChainsNonFungibleToken, tokenInfo?: AllChainsNonFungibleToken) {
    if (!token && !tokenInfo) return false
    return isSameAddress(token?.address, tokenInfo?.address) && token?.tokenId === tokenInfo?.tokenId
}
interface NFTListDialogProps {
    onNext: () => void
    tokenInfo?: AllChainsNonFungibleToken
    wallets?: BindingProof[]
    onSelected: (info: SelectTokenInfo) => void
}

export function NFTListDialog(props: NFTListDialogProps) {
    const { onNext, wallets = EMPTY_LIST, onSelected, tokenInfo } = props
    const { classes } = useStyles()
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const account = useAccount(currentPluginId)
    const wallet = useWallet(currentPluginId)
    const currentChainId = useChainId(currentPluginId)
    const [chainId, setChainId] = useState<ChainId>((currentChainId ?? ChainId.Mainnet) as ChainId)
    const [open_, setOpen_] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(account ?? wallets?.[0]?.identity ?? '')
    const [selectedPluginId, setSelectedPluginId] = useState(currentPluginId ?? NetworkPluginID.PLUGIN_EVM)
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>(tokenInfo)
    const [disabled, setDisabled] = useState(false)
    const t = useI18N()
    const [tokens, setTokens] = useState<AllChainsNonFungibleToken[]>([])
    const lastRecognizedProfile = useSubscription(context.lastRecognizedProfile)

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network: NetworkType) => networkResolver.networkChainId(network))
    }, [])

    const {
        value: collectibles = EMPTY_LIST,
        done: loadFinish,
        next: nextPage,
        error: loadError,
    } = useNonFungibleAssets(selectedPluginId, undefined, {
        chainId,
        account: selectedAccount,
    })

    const { showSnackbar } = useCustomSnackbar()
    const onChangeWallet = (address: string, pluginId: NetworkPluginID, chainId: ChainId) => {
        setSelectedAccount(address)
        setSelectedPluginId(pluginId)
        setChainId(chainId)
        setSelectedToken(undefined)
    }

    const onChangeToken = (token: AllChainsNonFungibleToken) => {
        setSelectedToken(token)
    }

    const onSave = useCallback(async () => {
        if (!selectedToken?.metadata?.imageURL) return
        setDisabled(true)

        try {
            const image = await toPNG(selectedToken.metadata.imageURL)
            if (!image) {
                showSnackbar(t.download_image_error(), { variant: 'error' })
                return
            }
            onSelected({
                image: URL.createObjectURL(image),
                account: selectedAccount,
                token: selectedToken,
                pluginId: selectedPluginId,
            })
            setDisabled(false)
            onNext()
        } catch (error) {
            showSnackbar(String(error), { variant: 'error' })
            return
        }
    }, [selectedToken, selectedAccount, selectedPluginId])

    const onClick = useCallback(() => {
        if (!account && !wallets?.length) {
            showSnackbar(t.connect_wallet(), { variant: 'error' })
            return
        }
        setOpen_(true)
    }, [account, wallets, showSnackbar])

    useEffect(() => {
        setDisabled(!selectedToken || isSameToken(selectedToken, tokenInfo))
    }, [selectedToken, tokenInfo])

    useEffect(() => {
        setSelectedPluginId(currentPluginId)
    }, [currentPluginId])

    useEffect(() => {
        setChainId(currentChainId as ChainId)
    }, [currentChainId])

    useEffect(() => setSelectedAccount(account || wallets?.[0]?.identity || ''), [account, wallets])

    const onAddClick = (token: AllChainsNonFungibleToken) => {
        setTokens((_tokens) => uniqBy([..._tokens, token], (x) => x.contract?.address.toLowerCase() + x.tokenId))
    }

    const onChangeChain = (chainId: ChainId) => {
        setChainId(chainId)
    }

    const AddCollectible = (
        <Box className={classes.error}>
            <Typography color="textSecondary" textAlign="center" fontSize={14} fontWeight={600}>
                {selectedPluginId === NetworkPluginID.PLUGIN_EVM ? (
                    chainId === ChainId.Matic ? (
                        <Translate.collectible_on_polygon
                            components={{
                                br: <br />,
                            }}
                        />
                    ) : (
                        t.collectible_no_eth()
                    )
                ) : (
                    t.collectible_no_collectible()
                )}
            </Typography>

            {selectedPluginId === NetworkPluginID.PLUGIN_EVM ? (
                <Button className={classes.AddCollectiblesButton} variant="text" onClick={() => setOpen_(true)}>
                    {t.add_collectible()}
                </Button>
            ) : null}
        </Box>
    )

    const Retry = (
        <Box className={classes.error}>
            <Typography color="textSecondary">{t.no_collectible_found()}</Typography>
            <Button className={classes.button} variant="text" onClick={nextPage}>
                {t.retry()}
            </Button>
        </Box>
    )

    const tokensInList = uniqBy(
        [...tokens.filter((x) => x.chainId === chainId), ...collectibles],
        selectedPluginId === NetworkPluginID.PLUGIN_SOLANA
            ? (x) => x.tokenId
            : (x) => x.contract?.address.toLowerCase() + x.tokenId,
    ).filter((x) => x.chainId === chainId)

    const NoNFTList = () => {
        if (chainId === ChainId.Matic && tokensInList.length) return
        if (tokensInList.length === 0) return AddCollectible
        if (loadError && !loadFinish && !collectibles.length) {
            return Retry
        }
        return
    }

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const openPopupsWindow = useCallback(() => {
        Services.Helper.openPopupWindow(PopupRoutes.ConnectedWallets, {
            chainId,
            internal: true,
        })
    }, [chainId])

    const theme = useTheme()
    const [menu, openMenu] = useMenu(
        [
            account ? (
                <>
                    <WalletItem
                        walletName={wallet?.name ?? ''}
                        selectedWallet={selectedAccount}
                        wallet={account}
                        nextIDWallets={wallets}
                        chainId={chainId as ChainId}
                        onConnectWallet={openSelectProviderDialog}
                        onSelectedWallet={onChangeWallet}
                        haveChangeWallet={Boolean(account)}
                    />
                    <Divider className={classes.divider} />
                </>
            ) : (
                <>
                    <MenuItem key="Connect Wallet">
                        <Button
                            fullWidth
                            onClick={openSelectProviderDialog}
                            sx={{ width: 311, padding: 1, borderRadius: 9999 }}>
                            {t.connect_your_wallet()}
                        </Button>
                    </MenuItem>
                    <Divider className={classes.divider} />
                </>
            ),
            <>
                {wallets
                    .sort((a, b) => Number.parseInt(b.created_at, 10) - Number.parseInt(a.created_at, 10))
                    .filter((x) => !isSameAddress(x.identity, account))
                    .map((x, i) => (
                        <div key={i}>
                            <WalletItem
                                selectedWallet={selectedAccount}
                                wallet={x.identity}
                                nextIDWallets={wallets}
                                chainId={chainId as ChainId}
                                onSelectedWallet={onChangeWallet}
                            />
                            <Divider className={classes.divider} />
                        </div>
                    ))}
            </>,
            <MenuItem
                key="Wallet Setting"
                onClick={() => {
                    openPopupsWindow()
                }}>
                <ListItemIcon>
                    <WalletSettingIcon style={{ fontSize: 24 }} />
                </ListItemIcon>
                <Typography fontSize={14} fontWeight={700}>
                    {t.wallet_settings()}
                </Typography>
                <Verify2Icon style={{ marginLeft: 24 }} />
            </MenuItem>,
        ],
        false,
        {
            paperProps: {
                style: {
                    background: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
                },
            },
        },
    )
    const onOpenMenu = useCallback(
        (ev: React.MouseEvent<HTMLDivElement>) => {
            ev.preventDefault()
            openMenu(ev)
        },
        [openMenu],
    )

    if (!wallets?.length && !account)
        return (
            <DialogContent className={classes.content}>
                <NFTWalletConnect />
            </DialogContent>
        )

    return (
        <>
            <DialogContent className={classes.content}>
                {account || Boolean(wallets?.length) ? (
                    <>
                        {currentPluginId === NetworkPluginID.PLUGIN_EVM ? (
                            <div className={classes.abstractTabWrapper}>
                                <NetworkTab
                                    chains={chains.filter(Boolean) as ChainId[]}
                                    chainId={chainId}
                                    setChainId={setChainId}
                                    classes={classes}
                                />
                            </div>
                        ) : null}

                        <NFTListPage
                            pluginId={selectedPluginId}
                            tokens={tokensInList}
                            tokenInfo={selectedToken}
                            onChange={onChangeToken}
                            children={NoNFTList()}
                            nextPage={nextPage}
                            loadError={!!loadError}
                            loadFinish={loadFinish}
                        />
                    </>
                ) : null}
            </DialogContent>

            <DialogActions className={classes.actions}>
                {selectedPluginId === NetworkPluginID.PLUGIN_EVM && tokensInList.length ? (
                    <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row', padding: '8px 16px' }}>
                        <Typography
                            variant="body1"
                            color="#1D9BF0"
                            sx={{ cursor: 'pointer' }}
                            fontWeight={700}
                            fontSize={14}
                            lineHeight="18px"
                            onClick={onClick}>
                            {t.add_collectible()}
                        </Typography>
                    </Stack>
                ) : null}
                <PluginWalletStatusBar onClick={(e) => onOpenMenu(e)}>
                    <Button onClick={onSave} disabled={disabled} fullWidth>
                        {!selectedToken ? t.set_PFP_title() : t.set_avatar_title()}
                    </Button>
                </PluginWalletStatusBar>
                {menu}
            </DialogActions>
            <AddNFT
                account={selectedAccount}
                chainId={chainId as ChainId}
                title={t.add_collectible()}
                open={open_}
                onClose={() => setOpen_(false)}
                onAddClick={onAddClick}
                expectedPluginID={selectedPluginId}
            />
        </>
    )
}
