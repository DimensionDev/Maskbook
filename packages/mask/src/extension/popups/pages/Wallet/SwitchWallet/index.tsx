import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, List } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { MAX_WALLET_LIMIT } from '@masknet/shared'
import { useWallet, useWallets, useWeb3Connection } from '@masknet/web3-hooks-base'
import { WalletItem } from './WalletItem.js'
import { useI18N } from '../../../../../utils/index.js'
import { Services } from '../../../../service.js'

const useStyles = makeStyles()({
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
        '&:hover': {
            backgroundColor: 'rgba(28, 104, 243, 0.04)',
        },
    },
})

const SwitchWallet = memo(() => {
    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const connection = useWeb3Connection()
    const navigate = useNavigate()
    const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)

    const handleClickCreate = useCallback(() => {
        if (!wallet) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/dashboard.html#/create-mask-wallet'),
            })
        } else {
            navigate(PopupRoutes.CreateWallet)
        }
    }, [wallet, history])

    const handleSelect = useCallback(
        async (address: string | undefined) => {
            await connection?.connect({
                account: address,
            })
            navigate(PopupRoutes.Wallet, { replace: true })
        },
        [history, connection],
    )

    return (
        <>
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
                    className={cx(classes.button, classes.secondaryButton)}
                    disabled={wallets.length >= MAX_WALLET_LIMIT}
                    onClick={handleClickCreate}>
                    {t('create')}
                </Button>
                <Button
                    variant="contained"
                    disabled={wallets.length >= MAX_WALLET_LIMIT}
                    className={classes.button}
                    onClick={() => {
                        if (process.env.engine === 'firefox') {
                            Services.Helper.openPopupWindow(PopupRoutes.ImportWallet)
                            return
                        }
                        navigate(PopupRoutes.ImportWallet)
                    }}>
                    {t('import')}
                </Button>
            </div>
        </>
    )
})

export default SwitchWallet
