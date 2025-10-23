import { Trans } from '@lingui/react/macro'
import { Flags } from '@masknet/flags'
import { ElementAnchor, NetworkTab, PluginVerifiedWalletStatusBar, ReloadStatus } from '@masknet/shared'
import { EMPTY_LIST, PopupModalRoutes, type BindingProof, type NetworkPluginID } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext, useNonFungibleAssets, useWallet } from '@masknet/web3-hooks-base'
import { getRegisteredWeb3Networks } from '@masknet/web3-providers'
import { Box, Button } from '@mui/material'
import { first, uniqBy } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useModalNavigate } from '../index.js'
import { CollectionList } from './CollectionList.js'

const useStyles = makeStyles()((theme) => ({
    picker: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
    },
    container: {
        overflow: 'auto',
        paddingBottom: 80,
    },
    collectionList: {
        paddingTop: 0,
    },
    bottomBar: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: theme.spacing(2),
        background: theme.palette.maskColor.secondaryBottom,
        backdropFilter: 'blur(8px)',
        zIndex: 2,
        boxSizing: 'border-box',
        height: 72,
        maxHeight: 72,
    },
}))

interface NFTAvatarPickerProps {
    onChange: (image: string) => void
    bindingWallets?: BindingProof[]
}

export const NFTAvatarPicker = memo<NFTAvatarPickerProps>(function NFTAvatarPicker({ onChange, bindingWallets }) {
    const { classes } = useStyles()
    const { pluginID } = useNetworkContext()
    const modalNavigate = useModalNavigate()
    const wallet = useWallet()
    const chains = useMemo(() => {
        const networks = getRegisteredWeb3Networks(pluginID)
        return networks.filter((x) => (Flags.support_testnet_switch ? true : x.isMainnet)).map((x) => x.chainId)
    }, [pluginID])

    const [selected, setSelected] = useState<Web3Helper.NonFungibleAssetAll | undefined>()

    const { account, chainId, setAccount, setChainId } = useChainContext()

    const defaultBindingWallet = first(bindingWallets)?.identity

    const {
        data: assets,
        hasNextPage,
        fetchNextPage,
        error,
        refetch,
        isPending,
    } = useNonFungibleAssets(pluginID, { chainId, account: account || defaultBindingWallet })

    const tokens = useMemo(() => uniqBy(assets, (x) => x.contract?.address.toLowerCase() + x.tokenId), [assets])

    const handleChangeWallet = useCallback(() => modalNavigate(PopupModalRoutes.SelectProvider, { onlyMask: true }), [])

    const handleChange = useCallback((address: string, pluginID: NetworkPluginID, chainId: Web3Helper.ChainIdAll) => {
        setAccount(address)
        setChainId(chainId)
        setSelected(undefined)
    }, [])

    return (
        <Box className={classes.picker}>
            <Box height={62} flexShrink={0}>
                <NetworkTab chains={chains} pluginID={pluginID} />
            </Box>
            <Box className={classes.container} data-hide-scrollbar>
                <CollectionList
                    className={classes.collectionList}
                    tokens={tokens}
                    loading={isPending}
                    account={account || defaultBindingWallet}
                    selected={selected}
                    onItemClick={setSelected}
                />
                {error && hasNextPage && tokens.length ?
                    <ReloadStatus
                        hideMessage
                        onRetry={refetch}
                        py={1}
                        style={{ gridColumnStart: 1, gridColumnEnd: 6 }}
                    />
                :   null}
                <ElementAnchor key={tokens.length} callback={() => fetchNextPage()}>
                    {hasNextPage && tokens.length !== 0 ?
                        <LoadingBase />
                    :   null}
                </ElementAnchor>
            </Box>
            <Box>
                <PluginVerifiedWalletStatusBar
                    onChange={handleChange}
                    onChangeWallet={handleChangeWallet}
                    verifiedWallets={bindingWallets ?? EMPTY_LIST}
                    className={classes.bottomBar}
                    expectedAddress={account}>
                    <Button
                        fullWidth
                        disabled={isPending || !selected}
                        onClick={() => {
                            if (!selected?.metadata?.imageURL) return
                            onChange(selected.metadata.imageURL)
                        }}>
                        <Trans>Confirm</Trans>
                    </Button>
                </PluginVerifiedWalletStatusBar>
            </Box>
        </Box>
    )
})
