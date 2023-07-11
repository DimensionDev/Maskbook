import { memo, useState } from 'react'
import type { z as zod } from 'zod'
import { useI18N } from '../../../../../utils/index.js'
import { Box, Link, Typography, useTheme } from '@mui/material'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useAsyncFn } from 'react-use'
import { useNavigate } from 'react-router-dom'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { usePasswordForm } from '../hooks/usePasswordForm.js'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { useBalance, useWallets } from '@masknet/web3-hooks-base'
import { Icons } from '@masknet/icons'
import { ChainId, explorerResolver, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { FormattedBalance } from '@masknet/shared'
import { formatBalance } from '@masknet/web3-shared-base'
import { Controller } from 'react-hook-form'
import { PasswordField } from '../../../components/PasswordField/index.js'
import { Trans } from 'react-i18next'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        background: theme.palette.maskColor.secondaryBottom,
    },
    content: {
        position: 'relative',
        padding: 16,
        display: 'flex',
        height: 386,
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        paddingTop: 8,
        paddingBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addWalletWrapper: {
        display: 'flex',
        width: '100%',
        padding: 12,
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        background: theme.palette.maskColor.bottom,
        borderRadius: 8,
        '&:last-child': {
            marginBottom: '0 !important',
        },
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontWeight: 700,
        marginBottom: 12,
    },
    subTitle: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.maskColor.main,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 700,
    },
    description: {
        color: theme.palette.maskColor.third,
        fontWeight: 400,
    },
    setPasswordButtonWrapper: {
        position: 'absolute',
        width: 368,
        bottom: 16,
        marginTop: 12,
    },
    bottomAction: {
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        backdropFilter: 'blur(8px)',
        width: '100%',
        bottom: 0,
        zIndex: 100,
    },
    confirmButton: {
        margin: '16px 0',
    },
    back: {
        position: 'absolute',
        top: 16,
        left: 16,
    },
    form: {
        width: '100%',
        height: 204,
        marginBottom: 128,
    },
    textField: {
        marginTop: 10,
    },
    strong: {
        color: theme.palette.maskColor.main,
    },
}))

const SetPaymentPassword = memo(function SetPaymentPassword() {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const [isCreating, setIsCreating] = useState(false)

    const theme = useTheme()

    const {
        control,
        handleSubmit,
        setError,
        formState: { errors, isValid },
        schema,
    } = usePasswordForm()

    const [{ loading }, onConfirm] = useAsyncFn(
        async (data: zod.infer<typeof schema>) => {
            try {
                await WalletRPC.changePassword(await WalletRPC.getDefaultUserPassword(), data.password)
                const hasPassword = await WalletRPC.hasPassword()
                if (hasPassword) {
                    navigate(PopupRoutes.Wallet, { replace: true })
                }
            } catch (error) {
                if (error instanceof Error) {
                    setError('password', { message: error.message })
                }
            }
        },
        [history, setError],
    )

    const onSubmit = handleSubmit(onConfirm)

    const errorMsg = errors.password?.message ?? errors.confirm?.message

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>
                        {isCreating
                            ? t('popups_wallet_create_payment_password')
                            : t('popups_set_the_payment_password_title')}
                    </Typography>
                    {isCreating ? (
                        <Typography className={classes.description} fontSize={14} fontWeight={700}>
                            {t('popups_wallet_create_payment_password_tip')}
                        </Typography>
                    ) : null}
                </Box>
                {isCreating ? (
                    <>
                        <form className={classes.form} onSubmit={onSubmit}>
                            <Controller
                                control={control}
                                render={({ field }) => (
                                    <PasswordField
                                        {...field}
                                        classes={{ root: classes.textField }}
                                        type="password"
                                        variant="filled"
                                        placeholder={t('popups_wallet_payment_password')}
                                        error={!isValid && !!errors.password?.message}
                                        helperText={!isValid ? errors.password?.message : ''}
                                    />
                                )}
                                name="password"
                            />
                            <Controller
                                render={({ field }) => (
                                    <PasswordField
                                        classes={{ root: classes.textField }}
                                        {...field}
                                        error={!isValid && !!errors.confirm?.message}
                                        helperText={!isValid ? errors.confirm?.message : ''}
                                        type="password"
                                        variant="filled"
                                        placeholder={t('popups_wallet_re_payment_password')}
                                    />
                                )}
                                name="confirm"
                                control={control}
                            />

                            {errorMsg ? (
                                <Typography fontSize={14} color={theme.palette.maskColor.danger} marginTop="12px">
                                    {errorMsg}
                                </Typography>
                            ) : null}
                        </form>
                        <Typography
                            color={theme.palette.maskColor.third}
                            fontSize={14}
                            textAlign="center"
                            fontWeight={700}>
                            <Trans i18nKey="popups_wallet_term_of_service_agree_part_1" />
                        </Typography>

                        <Typography
                            color={theme.palette.maskColor.third}
                            marginBottom="24px"
                            fontSize={14}
                            textAlign="center"
                            fontWeight={700}>
                            <Trans
                                i18nKey="popups_wallet_term_of_service_agree_part_2"
                                components={{ strong: <strong className={classes.strong} /> }}
                            />
                        </Typography>
                    </>
                ) : (
                    <>
                        {wallets.slice(0, 3).map((wallet, index) => (
                            <WalletItem address={wallet.address} key={index} />
                        ))}
                        <div className={classes.setPasswordButtonWrapper}>
                            <ActionButton fullWidth onClick={() => setIsCreating(true)}>
                                {t('popups_set_the_payment_password_title')}
                            </ActionButton>
                        </div>
                    </>
                )}
            </Box>

            {isCreating ? (
                <div className={classes.bottomAction}>
                    <ActionButton
                        fullWidth
                        onClick={onSubmit}
                        loading={loading}
                        width={368}
                        className={classes.confirmButton}>
                        {t('confirm')}
                    </ActionButton>
                </div>
            ) : null}

            {isCreating ? <Icons.Comeback className={classes.back} onClick={() => setIsCreating(false)} /> : null}
        </Box>
    )
})

interface WalletItemProps {
    address: string
}

function WalletItem({ address }: WalletItemProps) {
    const { classes } = useStyles()
    const { data: balance = '0' } = useBalance(NetworkPluginID.PLUGIN_EVM, {
        account: address,
        chainId: ChainId.Mainnet,
    })
    const theme = useTheme()

    return (
        <Box className={classes.addWalletWrapper}>
            <Icons.ETH size={30} />
            <div>
                <Typography className={classes.subTitle}>
                    {formatEthereumAddress(address, 6)}{' '}
                    <Link
                        underline="none"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={explorerResolver.addressLink(ChainId.Mainnet, address)}
                        marginLeft="4px"
                        width={16}
                        height={16}>
                        <Icons.LinkOut size={16} color={theme.palette.maskColor.main} />
                    </Link>
                </Typography>
                <Typography className={classes.description} fontSize={12}>
                    <FormattedBalance value={balance} decimals={18} symbol="ETH" formatter={formatBalance} />
                </Typography>
            </div>
        </Box>
    )
}

export default SetPaymentPassword
