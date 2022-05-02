import { memo, useCallback, useState } from 'react'
import { Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icon } from '@masknet/icons'
import { useNavigate } from 'react-router-dom'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { PopupRoutes } from '@masknet/shared-base'
import { first } from 'lodash-unified'
import { FormattedAddress } from '@masknet/shared'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import { useI18N } from '../../../../../utils'
import { PasswordField } from '../../../components/PasswordField'
import { currentMaskWalletAccountSettings } from '../../../../../plugins/Wallet/settings'
import { useWallet } from '@masknet/plugin-infra/web3'
import { WalletContext } from '../hooks/useWalletContext'
import { useTitle } from '../../../hook/useTitle'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
    },
    warning: {
        padding: '27px 0 13px 0',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    title: {
        marginTop: 14,
        color: ' #FF5F5F',
        fontSize: 18,
        fontWeight: 500,
        lineHeight: '24px',
    },
    tip: {
        color: '#FF5F5F',
        fontSize: 12,
        lineHeight: '16px',
        margin: '20px 0',
    },
    label: {
        color: '#1C68F3',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: '0 16px 16px 16px',
    },
    cancelButton: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        color: '#1C68F3',
        lineHeight: '20px',
        backgroundColor: '#F7F9FA',
    },
    deleteButton: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        color: '#ffffff',
        lineHeight: '20px',
        backgroundColor: '#FF5F5F',
    },
    info: {
        display: 'flex',
        backgroundColor: '#F7F9FA',
        borderRadius: 8,
        padding: '8px 16px',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: 20,
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: '#1C68F3',
        fontWeight: 500,
    },
    address: {
        fontSize: 12,
        color: '#1C68F3',
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
})

const DeleteWallet = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const { selectedWallet } = WalletContext.useContainer()
    const currentWallet = useWallet()
    const wallet = selectedWallet ?? currentWallet

    const { classes } = useStyles()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const onConfirm = useCallback(async () => {
        if (wallet?.address) {
            try {
                await WalletRPC.removeWallet(wallet.address, password)
                const wallets = await WalletRPC.getWallets()
                const otherWalletAddress = first(wallets)?.address

                if (otherWalletAddress) {
                    await WalletRPC.updateMaskAccount({
                        account: otherWalletAddress,
                    })
                } else {
                    currentMaskWalletAccountSettings.value = ''
                }

                navigate(PopupRoutes.Wallet, { replace: true })
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMessage(error.message)
                }
            }
        }
    }, [wallet, password])

    useTitle(t('popups_delete_wallet'))

    return (
        <>
            <div className={classes.content}>
                <div className={classes.warning}>
                    <Icon type="warning" size={48} />
                    <Typography className={classes.title}>{t('delete_wallet')}</Typography>
                </div>
                <div className={classes.info}>
                    <div className={classes.iconContainer}>
                        <Icon type="wallet" />
                    </div>
                    <div>
                        <Typography className={classes.name}>{wallet?.name}</Typography>
                        <Typography className={classes.address}>
                            <FormattedAddress address={wallet?.address} size={10} formatter={formatEthereumAddress} />
                        </Typography>
                    </div>
                </div>
                <Typography className={classes.tip}>{t('popups_wallet_delete_tip')}</Typography>

                <Typography className={classes.label}>{t('popups_wallet_confirm_payment_password')}</Typography>
                <PasswordField
                    placeholder={t('popups_wallet_backup_input_password')}
                    value={password}
                    error={!!errorMessage}
                    helperText={errorMessage}
                    onChange={(e) => {
                        if (errorMessage) setErrorMessage('')
                        setPassword(e.target.value)
                    }}
                />
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    color="inherit"
                    className={classes.cancelButton}
                    onClick={() => navigate(-1)}>
                    {t('cancel')}
                </Button>
                <Button variant="contained" color="error" className={classes.deleteButton} onClick={onConfirm}>
                    {t('delete')}
                </Button>
            </div>
        </>
    )
})

export default DeleteWallet
