import { compact, uniqBy } from 'lodash-es'
import { useCallback, useEffect, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { Icons } from '@masknet/icons'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import {
    AddCollectiblesModal,
    ChainBoundary,
    CollectionList,
    PluginVerifiedWalletStatusBar,
    UserAssetsProvider,
    useSharedI18N,
} from '@masknet/shared'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext, useWallets, useWeb3Connection, useWeb3Hub } from '@masknet/web3-hooks-base'
import { isGreaterThan, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { Box, Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { supportPluginIds } from '../constants.js'
import { useAvatarManagement } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { type AllChainsNonFungibleToken, PFP_TYPE } from '../types.js'
import { toPNG } from '../utils/index.js'
import { RoutePaths } from './Routes.js'

const useStyles = makeStyles()((theme) => ({
    actions: {
        backgroundColor: theme.palette.maskColor.bottom,
        position: 'absolute',
        zIndex: 3,
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
        padding: 0,
        backgroundColor: theme.palette.maskColor.bottom,
        '::-webkit-scrollbar': {
            display: 'none',
        },
        overflow: 'hidden',
        display: 'flex',
    },
    addButton: {
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.primary,
    },
    noWallet: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
    },
}))

const gridProps = {
    columns: 'repeat(auto-fill, minmax(20%, 1fr))',
}
export function NFTListDialog() {
    const t = useI18N()
    const sharedI18N = useSharedI18N()
    const { classes } = useStyles()
    const { pfpType, proofs, tokenInfo, targetAccount, setTargetAccount, setSelectedTokenInfo, proof } =
        useAvatarManagement()

    const navigate = useNavigate()

    const { pluginID } = useNetworkContext()
    const { account, chainId, setChainId, setAccount } = useChainContext()
    const [assetChainId, setAssetChainId] = useState<ChainId>()
    const wallets = useWallets(pluginID)
    const [selectedPluginId, setSelectedPluginId] = useState(pluginID ?? NetworkPluginID.PLUGIN_EVM)
    const [selectedToken, setSelectedToken] = useState<Web3Helper.NonFungibleTokenAll | undefined>(tokenInfo)
    const [disabled, setDisabled] = useState(false)
    const [pendingTokenCount, setPendingTokenCount] = useState(0)
    const [tokens, setTokens] = useState<AllChainsNonFungibleToken[]>([])
    const { openPopupWindow } = useSNSAdaptorContext()
    const targetWallet = wallets.find((x) => isSameAddress(targetAccount, x.address))

    useEffect(() => {
        setChainId(ChainId.Mainnet)
        setSelectedToken(undefined)
    }, [pfpType])

    useEffect(() => setSelectedToken(undefined), [chainId])

    const { showSnackbar } = useCustomSnackbar()
    const onChangeWallet = (address: string, pluginID: NetworkPluginID, chainId: Web3Helper.ChainIdAll) => {
        setAccount(address)
        setTargetAccount(address)
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

    const Web3 = useWeb3Connection(pluginID)
    const Hub = useWeb3Hub(pluginID)
    const handleAddCollectibles = useCallback(async () => {
        const results = await AddCollectiblesModal.openAndWaitForClose({
            pluginID,
            chainId: assetChainId,
            account: targetAccount,
        })
        if (!results || !assetChainId) return
        const [contract, tokenIds] = results
        const address = contract.address
        setPendingTokenCount((count) => count + tokenIds.length)
        const allSettled = await Promise.allSettled(
            tokenIds.map(async (tokenId) => {
                const [asset, token, isOwner] = await Promise.all([
                    Hub.getNonFungibleAsset(address, tokenId, {
                        chainId: assetChainId,
                        account: targetAccount,
                    }),
                    Web3.getNonFungibleToken(address, tokenId, undefined, {
                        chainId: assetChainId,
                    }),
                    Web3.getNonFungibleTokenOwnership(address, tokenId, targetAccount, undefined, {
                        chainId: assetChainId,
                    }),
                ])

                if (!asset?.contract?.chainId || !token.chainId || token.contract?.chainId !== assetChainId) return
                if (!isOwner) return
                return { ...token, ...asset } as AllChainsNonFungibleToken
            }),
        )
        setPendingTokenCount((count) => Math.max(count - tokenIds.length, 0))
        const tokens = compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : null)))
        if (!tokens.length) return
        setTokens((originalTokens) => {
            return uniqBy([...originalTokens, ...tokens], (x) => `${x.contract?.address}.${x.tokenId}`)
        })
    }, [pluginID, assetChainId, targetAccount])

    useEffect(() => {
        setSelectedPluginId(pluginID)
    }, [pluginID])

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
                    <UserAssetsProvider pluginID={selectedPluginId} account={targetAccount}>
                        <CollectionList
                            height={479}
                            gridProps={gridProps}
                            disableWindowScroll
                            selectedAsset={selectedToken}
                            additionalAssets={tokens}
                            pendingAdditionalAssetCount={pendingTokenCount}
                            onItemClick={setSelectedToken}
                            onChainChange={setAssetChainId as (chainId?: Web3Helper.ChainIdAll) => void}
                        />
                    </UserAssetsProvider>
                ) : (
                    <Box className={classes.noWallet} height={479}>
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
                    {selectedPluginId === NetworkPluginID.PLUGIN_EVM && assetChainId ? (
                        <Button
                            variant="text"
                            size="small"
                            className={classes.addButton}
                            disableRipple
                            onClick={handleAddCollectibles}>
                            {t.add_collectible()}
                        </Button>
                    ) : (
                        <div />
                    )}

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
                            Simplehash
                        </Typography>
                        <Icons.SimpleHash />
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
                    expectedAddress={targetAccount}>
                    <ChainBoundary
                        expectedChainId={chainId}
                        predicate={supportPluginIds.includes(selectedPluginId) ? () => true : undefined}
                        expectedAccount={targetAccount}
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
        </>
    )
}
