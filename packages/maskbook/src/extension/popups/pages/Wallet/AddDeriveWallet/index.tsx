import { memo, useCallback, useState } from 'react'
import { Button, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { HD_PATH_WITHOUT_INDEX_ETHEREUM } from '@masknet/plugin-wallet'
import { useLocation } from 'react-router-dom'
import { useAsync } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { DeriveWalletTable } from '../components/DeriveWalletTable'
import { currySameAddress, useWallets } from '@masknet/web3-shared'
import { useI18N } from '../../../../../utils'

const useStyles = makeStyles()({
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
    controller: {
        display: 'grid',
        marginTop: 24,
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
    },
    button: {
        padding: '10px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
})

const AddDeriveWallet = memo(() => {
    const { t } = useI18N()
    const location = useLocation()
    const { classes } = useStyles()
    const wallets = useWallets()
    const mnemonic = new URLSearchParams(location.search).get('mnemonic')
    const [page, setPage] = useState(0)

    const { loading, value: dataSource } = useAsync(async () => {
        if (mnemonic) {
            const derivedWallets = await WalletRPC.queryDerivableWalletFromPhrase(mnemonic.split(' '), '', page + 1)

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
    }, [mnemonic, wallets, page])

    const onAdd = useCallback(
        async (index) => {
            if (mnemonic) {
                await WalletRPC.deriveWalletFromIndex(mnemonic.split(' '), '', index)
            }
        },
        [mnemonic],
    )

    return (
        <div className={classes.container}>
            <div className={classes.header}>
                <Typography className={classes.title}>{t('plugin_wallet_import_wallet')}</Typography>
                <NetworkSelector />
            </div>
            <Typography className={classes.path}>
                {t('popups_wallet_derivation_path', {
                    path: HD_PATH_WITHOUT_INDEX_ETHEREUM,
                })}
            </Typography>
            <DeriveWalletTable loading={loading} dataSource={dataSource} onAdd={onAdd} />
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    disabled={page === 0 || loading}
                    onClick={() => setPage((prev) => prev - 1)}>
                    {t('popups_wallet_previous')}
                </Button>
                <Button
                    variant="contained"
                    className={classes.button}
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={loading}>
                    {t('popups_wallet_next')}
                </Button>
            </div>
        </div>
    )
})

export default AddDeriveWallet
