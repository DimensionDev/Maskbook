import { memo, useMemo, useState } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import { Box, Button, Link, TextField, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import type { TransactionDetail } from '../../pages/Wallet/type.js'
import { NUMERIC_INPUT_REGEXP_PATTERN, NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useChainIdSupport, useFungibleToken, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { Trans } from 'react-i18next'
import { CopyButton, TokenIcon } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { explorerResolver } from '@masknet/web3-shared-evm'
import { GasSettingMenu } from '../GasSettingMenu/index.js'
import { isGreaterThan, leftShift } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 18,
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: '22px',
    },
    tips: {
        fontSize: 12,
        fontWeight: 700,
        textAlign: 'center',
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(1.25),
    },
    tokenInfo: {
        background: theme.palette.maskColor.modalTitleBg,
        padding: theme.spacing(1),
        marginTop: theme.spacing(1.25),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 99,
    },
    tokenIcon: {
        width: 24,
        height: 24,
        borderRadius: '50%',
    },
    name: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
    address: {
        fontSize: 10,
        color: theme.palette.maskColor.second,
        fontWeight: 700,
    },
    link: {
        width: 16,
        height: 16,
        color: theme.palette.maskColor.main,
    },
    amountInfo: {
        marginTop: theme.spacing(3.25),
        padding: theme.spacing(1.5),
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
    },
    input: {
        paddingRight: '0px !important',
    },
    max: {
        fontWeight: 400,
        textTransform: 'uppercase',
    },
    spender: {
        color: theme.palette.maskColor.second,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
    },
    gasFeeTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
}))

export interface UnlockERC20TokenProps {
    transaction: TransactionDetail
    handleChange: (amount: string) => void
}

export const UnlockERC20Token = memo<UnlockERC20TokenProps>(function UnlockERC20Token({ transaction, handleChange }) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const theme = useTheme()
    const [value, setValue] = useState('')

    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const { data: token } = useFungibleToken(
        NetworkPluginID.PLUGIN_EVM,
        transaction.formattedTransaction?.tokenInAddress,
    )

    const { data: balance = '0' } = useFungibleTokenBalance(
        NetworkPluginID.PLUGIN_EVM,
        transaction.formattedTransaction?.tokenInAddress,
    )

    const initConfig = useMemo(() => {
        if (!transaction?.computedPayload) return
        if (isSupport1559) {
            if (transaction.computedPayload.maxFeePerGas && transaction.computedPayload.maxPriorityFeePerGas)
                return {
                    maxFeePerGas: transaction.computedPayload.maxFeePerGas,
                    maxPriorityFeePerGas: transaction.computedPayload.maxPriorityFeePerGas,
                }
            return
        }

        if (!transaction.computedPayload.gasPrice) return

        return {
            gasPrice: transaction.computedPayload.gasPrice,
        }
    }, [transaction?.computedPayload, isSupport1559])

    if (!transaction.formattedTransaction) return null

    return (
        <Box>
            <Typography className={classes.title}>
                <Trans
                    i18nKey="popups_wallet_unlock_erc20_title"
                    components={{ br: <br /> }}
                    values={{ symbol: token?.symbol }}
                />
            </Typography>
            <Typography className={classes.tips}>
                <Trans i18nKey="popups_wallet_unlock_erc20_tips" components={{ br: <br /> }} />
            </Typography>
            <Box className={classes.tokenInfo}>
                <TokenIcon
                    address={token?.address ?? ''}
                    chainId={chainId}
                    name={token?.name}
                    className={classes.tokenIcon}
                />
                <Box flex={1} ml={1}>
                    <Typography className={classes.name}>{token?.symbol}</Typography>
                    <Typography className={classes.address}>{token?.address}</Typography>
                </Box>
                {token?.address ? (
                    <Box display="flex" columnGap={1} alignItems="center">
                        <CopyButton text={token.address} size={16} />
                        <Link href={explorerResolver.addressLink(chainId, token.address)} className={classes.link}>
                            <Icons.LinkOut size={16} />
                        </Link>
                    </Box>
                ) : null}
            </Box>
            <Box className={classes.amountInfo}>
                <TextField
                    fullWidth
                    placeholder={t('popups_wallet_unlock_erc20_placeholder')}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value)
                        handleChange(e.target.value)
                    }}
                    InputProps={{
                        endAdornment: (
                            <Button
                                variant="text"
                                className={classes.max}
                                onClick={() => {
                                    const result = leftShift(balance, token?.decimals).toString()
                                    setValue(leftShift(balance, token?.decimals).toString())
                                    handleChange(result)
                                }}>
                                {t('max')}
                            </Button>
                        ),
                        disableUnderline: true,
                        className: classes.input,
                        inputProps: {
                            pattern: NUMERIC_INPUT_REGEXP_PATTERN,
                        },
                    }}
                />
                {value ? (
                    <Typography
                        fontSize={12}
                        fontWeight={700}
                        color={
                            isGreaterThan(value, leftShift(balance, token?.decimals))
                                ? theme.palette.maskColor.danger
                                : theme.palette.maskColor.warn
                        }>
                        {isGreaterThan(value, leftShift(balance, token?.decimals))
                            ? t('popups_wallet_unlock_erc20_balance_too_high_tips')
                            : t('popups_wallet_unlock_erc20_balance_tips', { amount: value, symbol: token?.symbol })}
                    </Typography>
                ) : null}
                <Typography className={classes.name}>{t('popups_wallet_unlock_erc20_requested_by')}</Typography>
                {transaction.formattedTransaction.popup?.spender ? (
                    <Typography className={classes.spender}>
                        {t('contract')}:{transaction.formattedTransaction.popup?.spender}
                        <Link
                            href={explorerResolver.addressLink(chainId, transaction.formattedTransaction.popup.spender)}
                            className={classes.link}
                            style={{ color: theme.palette.maskColor.second }}>
                            <Icons.LinkOut size={16} />
                        </Link>
                    </Typography>
                ) : null}
            </Box>

            <Box mt={3.75} display="flex" justifyContent="space-between" alignItems="center">
                <Typography className={classes.gasFeeTitle}>{t('popups_wallet_gas_fee')}</Typography>
                {transaction.computedPayload.gas && initConfig ? (
                    <GasSettingMenu
                        gas={transaction.computedPayload.gas}
                        initConfig={initConfig}
                        disable
                        paymentToken={transaction.paymentToken}
                        allowMaskAsGas={transaction.allowMaskAsGas}
                    />
                ) : null}
            </Box>
        </Box>
    )
})
