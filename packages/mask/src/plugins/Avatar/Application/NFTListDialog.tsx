import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { ChainId, networkResolver } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { Box, Button, DialogActions, DialogContent, Skeleton, Stack, Typography } from '@mui/material'
import { useCallback, useState, useEffect } from 'react'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import { BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { AllChainsNonFungibleToken, NFT_USAGE, SelectTokenInfo } from '../types'
import { range, uniqBy } from 'lodash-unified'
import { Translate, useI18N } from '../locales'
import { useAccount, useChainId, useCurrentWeb3NetworkPluginID, useNonFungibleAssets } from '@masknet/plugin-infra/web3'
import { NFTWalletConnect } from './WalletConnect'
import { toPNG } from '../utils'
import { NFTListPage } from './NFTListPage'
import { PluginWalletStatusBar } from '../../../utils'
import { useSubscription } from 'use-subscription'
import { context } from '../context'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../Wallet/messages'
import { CheckedIcon, UncheckIcon } from '../assets/checked'
import classNames from 'classnames'

const useStyles = makeStyles<{ networkPluginId: NetworkPluginID }>()((theme, props) => ({
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
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        flex: 1,
        flexShrink: 0,
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

    icon: {
        width: 24,
        height: 24,
    },
    iconShadow: {
        filter: 'drop-shadow(0px 0px 6px rgba(28, 104, 243, 0.6))',
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    radio: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
    },
    header: {
        position: 'absolute',
        width: '100%',
        backdropFilter: 'blur(20px)',
        zIndex: 100,
    },
    page: {
        paddingTop: props.networkPluginId === NetworkPluginID.PLUGIN_EVM ? 89 : 54,
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
    const { onNext, wallets, onSelected, tokenInfo } = props
    const currentIdentity = useSubscription(context.lastRecognizedProfile)
    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const account = useAccount(currentPluginId)
    const currentChainId = useChainId(currentPluginId)
    const [chainId, setChainId] = useState<ChainId>((currentChainId ?? ChainId.Mainnet) as ChainId)
    const [open_, setOpen_] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(account ?? wallets?.[0]?.identity ?? '')
    const [selectedPluginId, setSelectedPluginId] = useState(currentPluginId ?? NetworkPluginID.PLUGIN_EVM)
    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>(tokenInfo)
    const [disabled, setDisabled] = useState(false)
    const t = useI18N()
    const { classes } = useStyles({ networkPluginId: selectedPluginId })
    const [tokens, setTokens] = useState<AllChainsNonFungibleToken[]>([])
    const [flag, setFlag] = useState(NFT_USAGE.NFT_PFP)
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

    const { value: chains = EMPTY_LIST } = useAsync(async () => {
        const networks = await WalletRPC.getSupportedNetworks()
        return networks.map((network) => networkResolver.networkChainId(network))
    }, [])

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
                flag,
            })
            setDisabled(false)
            onNext()
        } catch (error) {
            showSnackbar(String(error), { variant: 'error' })
            return
        }
    }, [selectedToken, selectedAccount, selectedPluginId, flag])

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

    const LoadStatus = (
        <div className={classes.gallery}>
            {range(8).map((i) => (
                <Skeleton key={i} animation="wave" variant="rectangular" className={classes.skeleton} />
            ))}
        </div>
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
        if (!collectibles.length && !loadFinish && !loadError) {
            return LoadStatus
        }
        if (chainId === ChainId.Matic && tokensInList.length) return
        if (tokensInList.length === 0) return AddCollectible
        if (loadError && !loadFinish && !collectibles.length) {
            return Retry
        }
        return
    }

    if (!wallets?.length && !account)
        return (
            <DialogContent className={classes.content}>
                <NFTWalletConnect />
            </DialogContent>
        )

    return (
        <>
            <DialogContent className={classes.content}>
                <Box className={classes.header}>
                    {selectedPluginId === NetworkPluginID.PLUGIN_EVM ? (
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                chains={chains.filter(Boolean) as ChainId[]}
                                chainId={chainId}
                                setChainId={setChainId}
                                classes={classes}
                            />
                        </div>
                    ) : null}

                    <Box className={classes.radioGroup}>
                        <Box className={classes.radio} onClick={() => setFlag(NFT_USAGE.NFT_PFP)}>
                            {flag === NFT_USAGE.NFT_PFP ? (
                                <CheckedIcon className={classNames(classes.icon, classes.iconShadow)} />
                            ) : (
                                <UncheckIcon className={classes.icon} />
                            )}
                            <Typography variant="body1">{t.set_nft_pfp()}</Typography>
                        </Box>
                        <Box className={classes.radio} onClick={() => setFlag(NFT_USAGE.NFT_BACKGROUND)}>
                            {flag === NFT_USAGE.NFT_BACKGROUND ? (
                                <CheckedIcon className={classNames(classes.icon, classes.iconShadow)} />
                            ) : (
                                <UncheckIcon className={classes.icon} />
                            )}
                            <Typography variant="body1">{t.set_nft_background()}</Typography>
                        </Box>
                    </Box>
                </Box>
                <Box className={classes.page}>
                    {(account || Boolean(wallets?.length)) && (
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
                    )}
                    {selectedPluginId === NetworkPluginID.PLUGIN_EVM && tokensInList.length ? (
                        <Stack sx={{ display: 'flex', flex: 1, flexDirection: 'row', paddingLeft: 2 }}>
                            <Typography
                                variant="body1"
                                color="#1D9BF0"
                                sx={{ cursor: 'pointer', paddingLeft: 0.5 }}
                                onClick={onClick}>
                                {t.add_collectible()}
                            </Typography>
                        </Stack>
                    ) : null}
                </Box>
            </DialogContent>
            <DialogActions className={classes.actions}>
                <PluginWalletStatusBar
                    actionProps={{
                        disabled,
                        action: onSave,
                        title: !selectedToken ? t.set_PFP_title() : t.set_avatar_title(),
                        waiting: t.downloading_image(),
                    }}
                    userId={currentIdentity?.identifier?.userId}
                    classes={{ button: classes.button }}
                    onChange={onChangeWallet}
                    haveMenu
                />
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
