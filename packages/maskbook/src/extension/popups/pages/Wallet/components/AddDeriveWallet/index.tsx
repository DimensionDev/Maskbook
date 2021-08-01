import { memo, useCallback } from 'react'
import { makeStyles, Typography } from '@material-ui/core'
import { NetworkSelector } from '../NetworkSelector'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import { useLocation } from 'react-router-dom'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../../../../plugins/Wallet/messages'
import { DeriveWalletTable } from '../DeriveWalletTable'
import { currySameAddress, useWallets } from '@masknet/web3-shared'

const useStyles = makeStyles(() => ({
    container: {
        padding: '16px 10px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 12,
        color: '#151818',
        lineHeight: 1.5,
        fontWeight: 500,
    },
    path: {
        marginTop: 26,
        marginBottom: 16,
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 600,
    },
}))

export const AddDeriveWallet = memo(() => {
    const location = useLocation()
    const classes = useStyles()
    const wallets = useWallets()
    const mnemonic = new URLSearchParams(location.search).get('mnemonic')

    const { loading, value: dataSource } = useAsync(async () => {
        if (mnemonic) {
            const derivedWallets = await WalletRPC.queryDerivableWalletFromPhrase(mnemonic.split(' '), '', 1)

            return derivedWallets.map((derivedWallet) => {
                const added = !!wallets.find(currySameAddress(derivedWallet.address))

                return {
                    added,
                    address: derivedWallet.address,
                    balance: derivedWallet.balance ?? '0',
                }
            })
        }
        return []
    }, [mnemonic, wallets])

    const onAdd = useCallback(
        async (index) => {
            if (mnemonic) {
                await WalletRPC.deriveWalletFromIndex(`Account${index}`, mnemonic.split(' '), '', index)
            }
        },
        [mnemonic],
    )

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <Typography className={classes.title}>Import the wallet</Typography>
                <NetworkSelector />
            </div>
            <Typography className={classes.path}>Derivation path ({HD_PATH_WITHOUT_INDEX_ETHEREUM})</Typography>
            <DeriveWalletTable loading={loading} dataSource={dataSource} onAdd={onAdd} />
            {/*    TODO: Paged */}
        </div>
    )
})
