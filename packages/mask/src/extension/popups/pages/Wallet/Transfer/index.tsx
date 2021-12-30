import { memo, useMemo, useState } from 'react'
import { MenuItem, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatBalance, NetworkType, ProviderType, useNetworkType, useWallets } from '@masknet/web3-shared-evm'
import { FormattedBalance, TokenIcon, useMenu } from '@masknet/shared'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../hooks/useWalletContext'
import { Transfer1559 } from './Transfer1559'
import { Prior1559Transfer } from './Prior1559Transfer'

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

const Transfer = memo(() => {
    const { classes } = useStyles()
    const networkType = useNetworkType()
    const wallets = useWallets(ProviderType.MaskWallet)
    const { assets, currentToken } = useContainer(WalletContext)
    const [selectedAsset, setSelectedAsset] = useState(currentToken)

    const otherWallets = useMemo(
        () => wallets.map((wallet) => ({ name: wallet.name ?? '', address: wallet.address })),
        [wallets],
    )

    const [assetsMenu, openAssetMenu] = useMenu(
        ...assets.map((asset, index) => {
            return (
                <MenuItem key={index} className={classes.assetItem} onClick={() => setSelectedAsset(asset)}>
                    <div className={classes.assetSymbol}>
                        <TokenIcon address={asset.token.address} />
                        <Typography>{asset.token.symbol}</Typography>
                    </div>
                    <Typography>
                        <FormattedBalance
                            value={asset.balance}
                            decimals={asset.token.decimals}
                            significant={4}
                            formatter={formatBalance}
                        />
                    </Typography>
                </MenuItem>
            )
        }),
    )

    return (
        <>
            {networkType === NetworkType.Ethereum ? (
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
