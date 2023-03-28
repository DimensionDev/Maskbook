import { Icons } from '@masknet/icons'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { ChainBoundary, NetworkTab, PluginVerifiedWalletStatusBar, useSharedI18N } from '@masknet/shared'
import { EMPTY_LIST, NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext, useNonFungibleAssets, useWallets } from '@masknet/web3-hooks-base'
import { isGreaterThan, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { first, uniqBy } from 'lodash-es'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUpdateEffect } from 'react-use'
import { SUPPORTED_CHAIN_IDS, supportPluginIds } from '../constants.js'
import { useAvatarManagement } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { AddNFT } from '../SNSAdaptor/AddNFT.js'
import { AllChainsNonFungibleToken, PFP_TYPE } from '../types.js'
import { toPNG } from '../utils/index.js'
import { NFTListPage } from './NFTListPage.js'
import { RoutePaths } from './Routes.js'

const useStyles = makeStyles()((theme) => ({
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
        '::-webkit-scrollbar': {
            display: 'none',
        },

        display: 'flex',
    },
    addButton: {
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.primary,
    },
    error: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flex: 1,
        rowGap: 22,
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        flex: 1,
        rowGap: 12,
    },
    abstractTabWrapper: {
        width: '100%',
        flex: 1,
        flexShrink: 0,
        position: 'absolute',
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
    noWallet: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
    },
}))

export const NFTListDialog: FC = () => {
    const t = useI18N()
    const sharedI18N = useSharedI18N()
    const { classes } = useStyles()
    const { pfpType, proofs, tokenInfo, targetAccount, setTargetAccount, setSelectedTokenInfo, proof } =
        useAvatarManagement()

    const navigate = useNavigate()

    const { pluginID } = useNetworkContext()
    const { account, chainId, setChainId, setAccount } = useChainContext()
    const wallets = useWallets(pluginID)
    const [selectedPluginId, setSelectedPluginId] = useState(pluginID ?? NetworkPluginID.PLUGIN_EVM)
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [selectedToken, setSelectedToken] = useState<Web3Helper.NonFungibleTokenAll | undefined>(tokenInfo)
    const [disabled, setDisabled] = useState(false)
    const [tokens, setTokens] = useState<AllChainsNonFungibleToken[]>([])
    const { openPopupWindow } = useSNSAdaptorContext()
    const [selectedAccount, setSelectedAccount] = useState(targetAccount)
    const targetWallet = wallets.find((x) => isSameAddress(targetAccount, x.address))

    // Set eth to the default chain
    const actualChainId = useMemo(() => {
        if (selectedPluginId !== NetworkPluginID.PLUGIN_EVM) return
        const defaultChain = first(SUPPORTED_CHAIN_IDS)
        if (!SUPPORTED_CHAIN_IDS.includes(chainId as ChainId) && defaultChain) return defaultChain
        return chainId
    }, [chainId, selectedPluginId])

    const {
        value: collectibles = EMPTY_LIST,
        done: loadFinish,
        next: nextPage,
        error: loadError,
        retry,
    } = useNonFungibleAssets(selectedPluginId, {
        chainId: actualChainId,
        account: selectedAccount,
    })

    useEffect(() => {
        setChainId(ChainId.Mainnet)
        setSelectedToken(undefined)
    }, [pfpType])

    useEffect(() => setSelectedToken(undefined), [actualChainId])

    const { showSnackbar } = useCustomSnackbar()
    const onChangeWallet = (address: string, pluginID: NetworkPluginID, chainId: Web3Helper.ChainIdAll) => {
        setAccount(address)
        setTargetAccount(address)
        setSelectedAccount(address)
        setSelectedPluginId(pluginID)
        setChainId(chainId as ChainId)
        setSelectedToken(undefined)
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
            setSelectedTokenInfo({
                image: URL.createObjectURL(image),
                account: targetAccount,
                token: selectedToken,
                pluginID: selectedPluginId,
            })
            navigate(RoutePaths.Upload)
        } catch (error) {
            showSnackbar(String(error), { variant: 'error' })
            return
        } finally {
            setDisabled(false)
        }
    }, [selectedToken, targetAccount, selectedPluginId, navigate, proof, proofs])

    const openAddDialog = useCallback(() => {
        if (!account && !proofs.length) {
            showSnackbar(t.connect_wallet(), { variant: 'error' })
            return
        }
        setAddDialogOpen(true)
    }, [account, !proofs.length, showSnackbar])

    useEffect(() => {
        setSelectedPluginId(pluginID)
    }, [pluginID])

    useEffect(() => {
        setChainId(chainId as ChainId)
    }, [chainId])

    const onAddToken = (token: AllChainsNonFungibleToken) => {
        setTokens((_tokens) => uniqBy([..._tokens, token], (x) => x.contract?.address?.toLowerCase() + x.tokenId))
    }

    const AddCollectible = (
        <Box className={classes.empty}>
            <Icons.EmptySimple variant="light" size={36} />
            <Typography color="textSecondary" textAlign="center" fontSize={14}>
                {t.collectible_no_collectible()}
            </Typography>
        </Box>
    )

    const Retry = (
        <Box className={classes.error}>
            <Typography color={(theme) => theme.palette.maskColor.main} fontWeight="bold" fontSize={12}>
                {t.load_failed()}
            </Typography>
            <Button variant="roundedContained" size="small" style={{ width: 88 }} onClick={retry}>
                {t.reload()}
            </Button>
        </Box>
    )

    const tokensInList = uniqBy(
        [...tokens.filter((x) => x.chainId === actualChainId), ...collectibles],
        (x) => x.contract?.address?.toLowerCase() + x.tokenId,
    ).filter((x) => (actualChainId ? x.chainId === actualChainId : true))

    const NoNFTList = () => {
        if (loadError && !collectibles.length) {
            return Retry
        }
        if (tokensInList.length === 0 && loadFinish) return AddCollectible
        return
    }

    const walletItems = proofs.sort((a, z) => {
        return isGreaterThan(a.last_checked_at, z.last_checked_at) ? -1 : 1
    })

    useUpdateEffect(() => {
        setTargetAccount(account)
    }, [account])

    return (
        <>
            <DialogContent className={classes.content}>
                {account || proofs.length ? (
                    <>
                        {selectedPluginId === NetworkPluginID.PLUGIN_EVM && actualChainId ? (
                            <div className={classes.abstractTabWrapper}>
                                <NetworkTab
                                    chains={SUPPORTED_CHAIN_IDS}
                                    classes={{
                                        tab: classes.tab,
                                        tabs: classes.tabs,
                                        tabPanel: classes.tabPanel,
                                        tabPaper: classes.tabPaper,
                                        indicator: classes.indicator,
                                    }}
                                    pluginID={NetworkPluginID.PLUGIN_EVM}
                                />
                            </div>
                        ) : null}

                        <NFTListPage
                            pluginID={selectedPluginId}
                            tokens={tokensInList}
                            tokenInfo={selectedToken}
                            onChange={setSelectedToken}
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
                        alignItems: 'center',
                        padding: '8px 16px',
                        justifyContent: 'space-between',
                    }}>
                    {selectedPluginId === NetworkPluginID.PLUGIN_EVM ? (
                        <Button
                            variant="text"
                            size="small"
                            className={classes.addButton}
                            disableRipple
                            onClick={openAddDialog}>
                            {t.add_collectible()}
                        </Button>
                    ) : null}
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
                            RSS3
                        </Typography>
                        <Icons.RSS3 />
                    </Stack>
                </Stack>

                <PluginVerifiedWalletStatusBar
                    openPopupWindow={() =>
                        openPopupWindow(PopupRoutes.ConnectedWallets, {
                            internal: true,
                        })
                    }
                    verifiedWallets={walletItems}
                    onChange={onChangeWallet}
                    expectedAddress={selectedAccount}>
                    <ChainBoundary
                        expectedChainId={chainId}
                        predicate={supportPluginIds.includes(selectedPluginId) ? () => true : undefined}
                        expectedAccount={selectedAccount}
                        expectedPluginID={
                            !supportPluginIds.includes(selectedPluginId) ? NetworkPluginID.PLUGIN_EVM : selectedPluginId
                        }>
                        <Button
                            onClick={onSave}
                            disabled={disabled || !selectedToken || !!targetWallet?.owner}
                            fullWidth>
                            {targetWallet?.owner
                                ? sharedI18N.coming_soon()
                                : t.set_up_title({ context: pfpType === PFP_TYPE.PFP ? 'pfp' : 'background' })}
                        </Button>
                    </ChainBoundary>
                </PluginVerifiedWalletStatusBar>
            </DialogActions>
            <AddNFT
                account={targetAccount}
                chainId={actualChainId as ChainId}
                title={t.add_collectible()}
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onAddToken={onAddToken}
                expectedPluginID={selectedPluginId}
            />
        </>
    )
}
