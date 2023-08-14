import { ElementAnchor, NetworkTab, PluginVerifiedWalletStatusBar, RetryHint } from '@masknet/shared'
import { Box, Button, Stack } from '@mui/material'
import { memo, useCallback, useMemo, useState } from 'react'
import { getRegisteredWeb3Networks } from '@masknet/plugin-infra'
import { useChainContext, useNetworkContext, useNonFungibleAssets, useWallet } from '@masknet/web3-hooks-base'
import { uniqBy } from 'lodash-es'
import { LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CollectionList } from './CollectionList.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { EMPTY_LIST, type NetworkPluginID, PopupModalRoutes, type BindingProof } from '@masknet/shared-base'
import { useModalNavigate } from '../index.js'
import { Flags } from '@masknet/flags'

const useStyles = makeStyles()((theme) => ({
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
    container: {
        maxHeight: 446,
        overflow: 'scroll',
        paddingBottom: 80,
    },
}))

export interface NFTAvatarPickerProps {
    onChange: (image: string) => void
    bindingWallets?: BindingProof[]
}

export const NFTAvatarPicker = memo<NFTAvatarPickerProps>(function NFTAvatarPicker({ onChange, bindingWallets }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { pluginID } = useNetworkContext()
    const modalNavigate = useModalNavigate()
    const wallet = useWallet()
    const chains = useMemo(() => {
        const networks = getRegisteredWeb3Networks(pluginID)
        return networks.filter((x) => (Flags.support_testnet_switch ? true : x.isMainnet)).map((x) => x.chainId)
    }, [])

    const [selected, setSelected] = useState<Web3Helper.NonFungibleAssetAll | undefined>()

    const { account, chainId, setAccount, setChainId } = useChainContext()

    const { value: assets, done, next, error, retry, loading } = useNonFungibleAssets(pluginID)

    const tokens = useMemo(() => {
        return uniqBy(assets, (x) => x.contract?.address.toLowerCase() + x.tokenId).filter((x) => x.chainId === chainId)
    }, [assets, chainId])

    const handleChangeWallet = useCallback(() => modalNavigate(PopupModalRoutes.SelectProvider, { onlyMask: true }), [])

    const handleChange = useCallback((address: string, pluginID: NetworkPluginID, chainId: Web3Helper.ChainIdAll) => {
        setAccount(address)
        setChainId(chainId)
        setSelected(undefined)
    }, [])

    return (
        <Box maxHeight={508}>
            <Box height={62}>
                <NetworkTab chains={chains} pluginID={pluginID} />
            </Box>
            <Box className={classes.container}>
                <CollectionList
                    tokens={tokens}
                    loading={loading}
                    account={account}
                    selected={selected}
                    onItemClick={setSelected}
                />
                {error && !done && tokens.length ? (
                    <Stack py={1} style={{ gridColumnStart: 1, gridColumnEnd: 6 }}>
                        <RetryHint hint={false} retry={next} />
                    </Stack>
                ) : null}
                <ElementAnchor callback={next}>{!done && tokens.length !== 0 && <LoadingBase />}</ElementAnchor>
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
                        disabled={loading || !selected || !!wallet?.owner}
                        onClick={() => {
                            if (!selected?.metadata?.imageURL) return
                            onChange(selected?.metadata?.imageURL)
                        }}>
                        {wallet?.owner ? t('coming_soon') : t('confirm')}
                    </Button>
                </PluginVerifiedWalletStatusBar>
            </Box>
        </Box>
    )
})
