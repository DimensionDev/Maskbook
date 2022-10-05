import { memo, useMemo, useState } from 'react'
import { MenuItem, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { chainResolver } from '@masknet/web3-shared-evm'
import { FormattedBalance, TokenIcon, useMenu } from '@masknet/shared'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../hooks/useWalletContext.js'
import { Transfer1559 } from './Transfer1559.js'
import { Prior1559Transfer } from './Prior1559Transfer.js'
import { useChainId, useWallets } from '@masknet/web3-hooks-base'
import { NetworkPluginID, formatBalance } from '@masknet/web3-shared-base'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'

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
    const { t } = useI18N()
    const { classes } = useStyles()
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
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
                            value={asset.balance}
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
