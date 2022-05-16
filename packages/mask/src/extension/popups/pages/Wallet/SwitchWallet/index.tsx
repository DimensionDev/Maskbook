import { memo, useCallback } from 'react'
import { Button, List } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { useI18N } from '../../../../../utils'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { NetworkSelector } from '../../../components/NetworkSelector'
import { currentProviderSettings } from '../../../../../plugins/Wallet/settings'
import { WalletItem } from './WalletItem'
import { MAX_WALLET_LIMIT } from '@masknet/shared'
import classNames from 'classnames'
import { useWallet, useWalletPrimary, useWallets } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()({
    header: {
        padding: 10,
        display: 'flex',
        marginBottom: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        overflow: 'auto',
        backgroundColor: '#F7F9FA',
        display: 'flex',
        flexDirection: 'column',
    },
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
        height: 'calc(100vh - 168px)',
        overflow: 'auto',
    },
    item: {
        padding: 10,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    address: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
    },
    copy: {
        fontSize: 12,
        stroke: '#1C68F3',
        marginLeft: 4,
        cursor: 'pointer',
    },
    name: {
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    text: {
        marginLeft: 4,
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: '#ffffff',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    secondaryButton: {
        backgroundColor: '#F7F9FA',
        color: '#1C68F3',
    },
})

const SwitchWallet = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()

    const navigate = useNavigate()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const walletPrimary = useWalletPrimary(NetworkPluginID.PLUGIN_EVM)

    const handleClickCreate = useCallback(() => {
        if (!walletPrimary) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/dashboard.html#/create-mask-wallet'),
            })
        } else {
            navigate(PopupRoutes.CreateWallet)
        }
    }, [walletPrimary, history])

    const handleSelect = useCallback(
        async (address: string | undefined) => {
            await WalletRPC.updateMaskAccount({
                account: address,
            })

            navigate(PopupRoutes.Wallet, { replace: true })
        },
        [history],
    )

    return (
        <>
            <div className={classes.header}>
                <NetworkSelector />
            </div>
            <div className={classes.content}>
                <List dense className={classes.list}>
                    {wallets.map((item, index) => (
                        <WalletItem
                            key={index}
                            wallet={item}
                            onClick={() => handleSelect(item.address)}
                            isSelected={isSameAddress(item.address, wallet?.address)}
                        />
                    ))}
                </List>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classNames(classes.button, classes.secondaryButton)}
                    disabled={wallets.length >= MAX_WALLET_LIMIT}
                    onClick={handleClickCreate}>
                    {t('create')}
                </Button>
                <Button
                    variant="contained"
                    disabled={wallets.length >= MAX_WALLET_LIMIT}
                    className={classes.button}
                    onClick={() => navigate(PopupRoutes.ImportWallet)}>
                    {t('import')}
                </Button>
            </div>
        </>
    )
})

export default SwitchWallet
