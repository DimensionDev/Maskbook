import { makeStyles } from '@masknet/theme'
import { memo, useMemo } from 'react'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import {
    TransactionDescriptorType,
    formatBalance,
    leftShift,
    formatCurrency,
    isGreaterThan,
    pow10,
    type TransactionDescriptor,
    type TransactionContext,
} from '@masknet/web3-shared-base'
import { type GasConfig, type Transaction, type ChainId, type TransactionParameter } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import {
    useChainContext,
    useChainIdSupport,
    useFungibleToken,
    useFungibleTokenPrice,
    useNativeToken,
    useReverseAddress,
} from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { unreachable } from '@masknet/kit'
import { isString } from 'lodash-es'
import { FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared'
import { GasSettingMenu } from '../GasSettingMenu/index.js'
import type { JsonRpcPayload } from 'web3-core-helpers'

const useStyles = makeStyles()((theme) => ({
    info: {
        background: theme.palette.maskColor.modalTitleBg,
        borderRadius: 8,
        padding: theme.spacing(1.5),
    },
    title: {
        fontSize: 20,
        fontWeight: 700,
        lineHeight: '24px',
    },
    addressTitle: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
    tokenIcon: {
        width: 24,
        height: 24,
    },
    amount: {
        display: 'flex',
        alignItems: 'center',
        columnGap: 10,
        fontSize: 18,
        fontWeight: 700,
    },
    value: {
        fontSize: 14,
        lineHeight: '18px',
    },
    gasFeeTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
}))

interface TransactionPreviewProps {
    transaction?: {
        owner?: string
        paymentToken?: string
        allowMaskAsGas?: boolean
        payload: JsonRpcPayload
        computedPayload: Partial<Transaction>
        formattedTransaction?: TransactionDescriptor<ChainId, Transaction, TransactionParameter>
        transactionContext?: TransactionContext<ChainId, TransactionParameter>
    }
    onConfigChange: (config: GasConfig) => void
}

export const TransactionPreview = memo<TransactionPreviewProps>(function TransactionPreview({
    transaction,
    onConfigChange,
}) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const { title, to, tokenAddress, amount } = useMemo(() => {
        const type = transaction?.formattedTransaction?.type

        if (!type) return {}

        switch (type) {
            case TransactionDescriptorType.INTERACTION:
                const to = transaction.owner
                    ? transaction.formattedTransaction?.context?.methods?.find((x) => x.name === 'transfer')?.parameters
                          ?.to
                    : undefined
                return {
                    title: transaction.formattedTransaction?.title ?? t('popups_wallet_contract_interaction'),
                    to: to && isString(to) ? to : transaction.computedPayload?.to,
                    tokenAddress: transaction.formattedTransaction?.tokenInAddress,
                    amount: transaction.formattedTransaction?.tokenInAmount ?? transaction.computedPayload.value,
                }
            case TransactionDescriptorType.TRANSFER:
                return {
                    title: t('wallet_transfer_send'),
                    to: transaction.computedPayload.to,
                    tokenAddress: '',
                    amount: transaction.computedPayload.value,
                }

            case TransactionDescriptorType.DEPLOYMENT:
            case TransactionDescriptorType.RETRY:
            case TransactionDescriptorType.CANCEL:
                throw new Error('Method not implemented.')
            default:
                unreachable(type)
        }
    }, [transaction])

    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const { data: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, to)

    const { data: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { data: token } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, tokenAddress || nativeToken?.address)
    const { data: tokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, token?.address, { chainId })

    const tokenValueUSD =
        amount && tokenPrice
            ? leftShift(amount, token?.decimals)
                  .times(tokenPrice)
                  .toString()
            : '0'

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

    if (!transaction) return

    return (
        <Box>
            <Box className={classes.info}>
                <Box display="flex" justifyContent="space-between">
                    <Typography className={classes.title}>{title}</Typography>
                    {domain ? <Typography className={classes.title}>{domain}</Typography> : null}
                </Box>
                <Box mt={2} display="flex" columnGap={0.5}>
                    <Typography className={classes.addressTitle}>{t('address')}:</Typography>
                    <Typography fontSize={12} fontWeight={700}>
                        {to}
                    </Typography>
                </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Typography className={classes.amount}>
                    <TokenIcon
                        address={(tokenAddress || nativeToken?.address) ?? ''}
                        chainId={chainId}
                        name={token?.name}
                        className={classes.tokenIcon}
                    />
                    <FormattedBalance
                        value={amount}
                        decimals={token?.decimals}
                        significant={4}
                        formatter={formatBalance}
                    />
                </Typography>
                {!isGreaterThan(tokenValueUSD, pow10(9)) ? (
                    <Typography className={classes.value}>
                        <FormattedCurrency value={tokenValueUSD} formatter={formatCurrency} />
                    </Typography>
                ) : null}
            </Box>
            <Box mt={3.75} display="flex" justifyContent="space-between" alignItems="center">
                <Typography className={classes.gasFeeTitle}>{t('popups_wallet_gas_fee')}</Typography>
                {transaction.computedPayload.gas && initConfig ? (
                    <GasSettingMenu
                        gas={transaction.computedPayload.gas}
                        initConfig={initConfig}
                        onChange={onConfigChange}
                        paymentToken={transaction.paymentToken}
                        allowMaskAsGas={transaction.allowMaskAsGas}
                    />
                ) : null}
            </Box>
        </Box>
    )
})
