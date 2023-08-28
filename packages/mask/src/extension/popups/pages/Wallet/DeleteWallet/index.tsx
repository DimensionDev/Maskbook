import { first } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useContainer } from 'unstated-next'
import { Box, Button, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { ProviderType, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { PopupRoutes } from '@masknet/shared-base'
import { ManageWallet } from '@masknet/shared'
import { useWallet, useWallets } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { Web3 } from '@masknet/web3-providers'
import { useI18N } from '../../../../../utils/index.js'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { useTitle, PopupContext } from '../../../hooks/index.js'

const useStyles = makeStyles()({
    content: {
        flex: 1,
        padding: '16px 16px 0 16px',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 350,
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
        wordWrap: 'break-word',
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
        padding: 16,
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
})

/**
 * @deprecated unused
 */
const DeleteWallet = memo(() => {
    const { t } = useI18N()
    const navigate = useNavigate()
    const currentWallet = useWallet()
    const wallets = useWallets()
    const [params] = useSearchParams()
    const paramWallet = wallets.find((x) => isSameAddress(x.address, params.get('wallet') || ''))
    const wallet = paramWallet ?? currentWallet

    const { classes } = useStyles()
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const { smartPayChainId } = useContainer(PopupContext)
    const onConfirm = useCallback(async () => {
        if (!wallet?.address) return
        try {
            await Web3.removeWallet?.(wallet.address, password, {
                providerType: ProviderType.MaskWallet,
            })
            const wallets = await Web3.getWallets?.({
                providerType: ProviderType.MaskWallet,
            })
            const newWallet = first(
                wallets?.filter(
                    (x) => !isSameAddress(x.address, wallet.address) && !isSameAddress(x.owner, wallet.address),
                ),
            )
            await Web3.connect({
                account: newWallet?.address,
                chainId: newWallet?.owner ? smartPayChainId : undefined,
                providerType: ProviderType.MaskWallet,
            })
            navigate(PopupRoutes.Wallet, { replace: true })
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(
                    error.message === 'Wrong password' ? t('popups_wallet_unlock_error_password') : error.message,
                )
            }
        }
    }, [wallet, password, smartPayChainId])

    const manageWallets = useMemo(() => {
        return wallets.filter((x) => isSameAddress(x.owner, wallet?.address))
    }, [wallets, wallet])

    useTitle(t('popups_delete_wallet'))

    return (
        <Box style={{ maxHeight: 502, overflowY: 'auto' }}>
            <div className={classes.content}>
                <div className={classes.warning}>
                    <Icons.Warning size={48} />
                    <Typography className={classes.title}>{t('delete_wallet')}</Typography>
                </div>
                <ManageWallet manageWallets={manageWallets} name={wallet?.name} address={wallet?.address} />
                {manageWallets.length && wallet?.address ? (
                    <>
                        <Typography className={classes.tip}>
                            <Trans
                                i18nKey="popups_smart_pay_delete_tip"
                                values={{
                                    management: formatEthereumAddress(wallet?.address, 4),
                                    addresses: manageWallets.map((x) => formatEthereumAddress(x.address, 4)).join(','),
                                }}
                                components={{
                                    span: <Typography component="span" sx={{ wordBreak: 'break-all', fontSize: 12 }} />,
                                }}
                            />
                        </Typography>
                        <Typography className={classes.tip} style={{ marginTop: 0 }}>
                            {t('popups_smart_pay_delete_tip_confirm')}
                        </Typography>
                    </>
                ) : (
                    <Typography className="tip">{t('popups_wallet_delete_tip')}</Typography>
                )}

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
        </Box>
    )
})

export default DeleteWallet
