import { FormattedBalance, TokenIcon, useMenu } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import {
    useAccount,
    useBalance,
    useChainContext,
    useFungibleTokenBalance,
    useNativeTokenAddress,
    useWallets,
} from '@masknet/web3-hooks-base'
import { formatBalance, isSameAddress } from '@masknet/web3-shared-base'
import { chainResolver, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { MenuItem, Typography } from '@mui/material'
import { first } from 'lodash-es'
import { memo, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useContainer } from 'unstated-next'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { WalletContext, useAsset } from '../hooks/index.js'
import { Prior1559Transfer } from './Prior1559Transfer.js'
import { Transfer1559 } from './Transfer1559.js'

const useStyles = makeStyles()({
    assetItem: {
        display: 'flex',
        justifyContent: 'space-between',
        minWidth: 278,
    },
    assetSymbol: {
        display: 'flex',
        alignItems: 'center',
        '& > p': {
            marginLeft: 10,
        },
    },
})

const Transfer = memo(function Transfer() {
    const location = useLocation()
    const { t } = useI18N()
    const { classes } = useStyles()
    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM)
    const address = useParams().address || nativeTokenAddress
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isNativeToken = !address || isNativeTokenAddress(address)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { assets } = useContainer(WalletContext)
    const { data: nativeTokenBalance = '0' } = useBalance(NetworkPluginID.PLUGIN_EVM)
    const { data: erc20Balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address)
    const balance = isNativeToken ? nativeTokenBalance : erc20Balance
    const currentAsset = useAsset(chainId, address, account)
    const [selectedAsset, setSelectedAsset] = useState(currentAsset ?? first(assets))

    const otherWallets = useMemo(
        () => wallets.map((wallet) => ({ name: wallet.name ?? '', address: wallet.address })),
        [wallets],
    )

    const [assetsMenu, openAssetMenu] = useMenu(
        ...assets.map((asset, index) => {
            return (
                <MenuItem key={index} className={classes.assetItem} onClick={() => setSelectedAsset(asset)}>
                    <div className={classes.assetSymbol}>
                        <TokenIcon
                            chainId={asset.chainId}
                            address={asset.address}
                            name={asset.name}
                            symbol={asset.symbol}
                        />
                        <Typography>{asset.symbol}</Typography>
                    </div>
                    <Typography>
                        <FormattedBalance
                            value={balance}
                            decimals={asset.decimals}
                            significant={4}
                            formatter={formatBalance}
                        />
                    </Typography>
                </MenuItem>
            )
        }),
    )

    useTitle(t('popups_send'))

    useEffect(() => {
        const address = new URLSearchParams(location.search).get('selectedToken')
        if (!address) return
        const target = assets.find((x) => isSameAddress(x.address, address))
        setSelectedAsset(target)
    }, [assets, location])

    return (
        <>
            {chainResolver.isSupport(chainId, 'EIP1559') ? (
                <Transfer1559 selectedAsset={selectedAsset} otherWallets={otherWallets} openAssetMenu={openAssetMenu} />
            ) : (
                <Prior1559Transfer
                    selectedAsset={selectedAsset}
                    otherWallets={otherWallets}
                    openAssetMenu={openAssetMenu}
                />
            )}
            {assetsMenu}
        </>
    )
})

export default Transfer
