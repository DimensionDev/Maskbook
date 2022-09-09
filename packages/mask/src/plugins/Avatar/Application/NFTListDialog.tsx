import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { first, uniqBy } from 'lodash-unified'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { ChainId, NetworkType } from '@masknet/web3-shared-evm'
import { isSameAddress, NetworkPluginID, isGreaterThan } from '@masknet/web3-shared-base'
import { Box, Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { AddNFT } from '../SNSAdaptor/AddNFT'
import { BindingProof, EMPTY_LIST } from '@masknet/shared-base'
import { AllChainsNonFungibleToken, PFP_TYPE, SelectTokenInfo } from '../types'
import { useI18N } from '../locales'
import { SUPPORTED_CHAIN_IDS } from '../constants'
import {
    useAccount,
    useChainId,
    useCurrentWeb3NetworkPluginID,
    useNonFungibleAssets,
    Web3Helper,
} from '@masknet/plugin-infra/web3'
import { toPNG } from '../utils'
import { NFTListPage } from './NFTListPage'
import { NetworkTab } from '../../../components/shared/NetworkTab'
import { PluginVerifiedWalletStatusBar } from '../../../utils/components/WalletStatusBar/PluginVerifiedWalletStatusBar'
import { Icons } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    AddressNames: {
        position: 'absolute',
        top: 10,
        right: 10,
    },

    button: {
        width: 88,
        height: 32,
        borderRadius: 999,
        backgroundColor: theme.palette.maskColor.main,
        color: theme.palette.maskColor.bottom,
        marginTop: 22,
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
        height: 450,
        padding: 0,
        backgroundColor: theme.palette.mode === 'dark' ? 'black' : 'white',
        marginBottom: 72,
        '::-webkit-scrollbar': {
            display: 'none',
        },

        display: 'flex',
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flex: 1,
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
    noWallet: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
    },
}))

function isSameToken(token?: AllChainsNonFungibleToken, tokenInfo?: AllChainsNonFungibleToken) {
    if (!token && !tokenInfo) return false
    return isSameAddress(token?.address, tokenInfo?.address) && token?.tokenId === tokenInfo?.tokenId
}
export interface NFTListDialogProps {
    onNext: () => void
    tokenInfo?: AllChainsNonFungibleToken
    wallets?: BindingProof[]
    onSelected: (info: SelectTokenInfo) => void
    pfpType: PFP_TYPE
    selectedAccount: string
    setSelectedAccount: Dispatch<SetStateAction<string>>
}

export function NFTListDialog(props: NFTListDialogProps) {
    const { onNext, wallets = EMPTY_LIST, onSelected, tokenInfo, pfpType, selectedAccount, setSelectedAccount } = props
    const { classes } = useStyles()

    const currentPluginId = useCurrentWeb3NetworkPluginID()
    const account = useAccount(currentPluginId)
    const currentChainId = useChainId(currentPluginId)

    const [chainId, setChainId] = useState<ChainId>((currentChainId ?? ChainId.Mainnet) as ChainId)
    const [selectedPluginId, setSelectedPluginId] = useState(currentPluginId ?? NetworkPluginID.PLUGIN_EVM)

    const [open_, setOpen_] = useState(false)

    const [selectedToken, setSelectedToken] = useState<AllChainsNonFungibleToken | undefined>(tokenInfo)
    const [disabled, setDisabled] = useState(false)
    const t = useI18N()
    const [tokens, setTokens] = useState<AllChainsNonFungibleToken[]>([])

    const {
        value: collectibles = EMPTY_LIST,
        done: loadFinish,
        next: nextPage,
        error: loadError,
    } = useNonFungibleAssets(selectedPluginId, undefined, {
        chainId,
        account: selectedAccount,
    })

    useEffect(() => {
        setChainId(ChainId.Mainnet)
        setSelectedToken(undefined)
    }, [pfpType])

    useEffect(() => setSelectedToken(undefined), [chainId])

    const { showSnackbar } = useCustomSnackbar()
    const onChangeWallet = (address: string, pluginId: NetworkPluginID, chainId: Web3Helper.ChainIdAll) => {
        setSelectedAccount(address)
        setSelectedPluginId(pluginId)
        setChainId(chainId as ChainId)
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

    const onAddClick = (token: AllChainsNonFungibleToken) => {
        setTokens((_tokens) => uniqBy([..._tokens, token], (x) => x.contract?.address?.toLowerCase() + x.tokenId))
    }

    const AddCollectible = (
        <Box className={classes.error}>
            <Icons.EmptySimple variant="light" size={36} />
            <Typography color="textSecondary" textAlign="center" fontSize={14} fontWeight={600} mt="14px">
                {t.collectible_no_collectible()}
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
            <Typography color={(theme) => theme.palette.maskColor.main} fontWeight="bold" fontSize={12}>
                {t.load_failed()}
            </Typography>
            <Button className={classes.button} variant="text" onClick={nextPage}>
                {t.reload()}
            </Button>
        </Box>
    )

    const tokensInList = uniqBy(
        [...tokens.filter((x) => x.chainId === chainId), ...collectibles],
        selectedPluginId === NetworkPluginID.PLUGIN_SOLANA
            ? (x) => x.tokenId
            : (x) => x.contract?.address?.toLowerCase() + x.tokenId,
    ).filter((x) => x.chainId === chainId)

    const NoNFTList = () => {
        if (chainId === ChainId.Matic && tokensInList.length) return
        if (tokensInList.length === 0) return AddCollectible
        if (loadError && !loadFinish && !collectibles.length) {
            return Retry
        }
        return
    }

    const walletItems = wallets.sort((a, z) => {
        return isGreaterThan(a.last_checked_at, z.last_checked_at) ? -1 : 1
    })

    // Set eth to the default chain
    const actualChainId = useMemo(() => {
        const defaultChain = first(SUPPORTED_CHAIN_IDS)
        if (!SUPPORTED_CHAIN_IDS.includes(chainId) && defaultChain) return defaultChain
        return chainId
    }, [chainId])

    return (
        <>
            <DialogContent className={classes.content}>
                {account || Boolean(wallets?.length) ? (
                    <>
                        {selectedPluginId === NetworkPluginID.PLUGIN_EVM ? (
                            <div className={classes.abstractTabWrapper}>
                                <NetworkTab
                                    chains={SUPPORTED_CHAIN_IDS}
                                    chainId={actualChainId}
                                    setChainId={setChainId}
                                    classes={classes}
                                    networkId={selectedPluginId}
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
                ) : (
                    <Box className={classes.noWallet}>
                        <Icons.EmptySimple variant="light" size={36} />
                        <Typography fontSize={14} color={(theme) => theme.palette.maskColor.second} mt="12px">
                            {t.no_wallet_message()}
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions className={classes.actions} disableSpacing>
                <Stack
                    sx={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        padding: '8px 16px',
                        justifyContent: 'space-between',
                    }}>
                    <Stack sx={{ flex: 1 }}>
                        {selectedPluginId === NetworkPluginID.PLUGIN_EVM && tokensInList.length ? (
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
                        ) : null}
                    </Stack>
                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Typography
                            style={{ paddingRight: 4 }}
                            variant="body1"
                            fontSize={14}
                            color={(theme) => theme.palette.maskColor.second}
                            fontWeight="bold">
                            {t.powered_by()}
                        </Typography>
                        <Typography
                            style={{ paddingRight: 4 }}
                            variant="body1"
                            fontSize={14}
                            fontWeight="bold"
                            color={(theme) => theme.palette.maskColor.main}>
                            MintTeam
                        </Typography>
                        <Icons.NonFungibleFriends style={{ paddingRight: 4 }} />
                        <Typography
                            style={{ paddingRight: 4 }}
                            variant="body1"
                            fontSize={14}
                            color={(theme) => theme.palette.maskColor.second}
                            fontWeight="bold">
                            &
                        </Typography>

                        <Typography
                            style={{ paddingRight: 4 }}
                            variant="body1"
                            fontSize={14}
                            fontWeight="bold"
                            color={(theme) => theme.palette.maskColor.main}>
                            RSS3
                        </Typography>
                        <Icons.RSS3 />
                    </Stack>
                </Stack>

                <PluginVerifiedWalletStatusBar
                    verifiedWallets={walletItems}
                    onChange={onChangeWallet}
                    expectedAddress={selectedAccount}>
                    <Button onClick={onSave} disabled={disabled} fullWidth>
                        {pfpType === PFP_TYPE.PFP ? t.set_PFP_title() : t.set_pfp_background_title()}
                    </Button>
                </PluginVerifiedWalletStatusBar>
            </DialogActions>
            <AddNFT
                account={selectedAccount}
                chainId={actualChainId as ChainId}
                title={t.add_collectible()}
                open={open_}
                onClose={() => setOpen_(false)}
                onAddClick={onAddClick}
                expectedPluginID={selectedPluginId}
            />
        </>
    )
}
