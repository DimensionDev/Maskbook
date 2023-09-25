import { makeStyles } from '@masknet/theme'
import { memo, useMemo } from 'react'
import { useMaskSharedI18N } from '../../../../utils/i18n-next-ui.js'
import {
    TransactionDescriptorType,
    formatBalance,
    leftShift,
    formatCurrency,
    isGreaterThan,
    pow10,
    isSameAddress,
} from '@masknet/web3-shared-base'
import { type GasConfig } from '@masknet/web3-shared-evm'
import { Box, Typography } from '@mui/material'
import {
    useChainContext,
    useChainIdSupport,
    useContacts,
    useFungibleToken,
    useFungibleTokenPrice,
    useNativeToken,
    useNonFungibleAsset,
    useReverseAddress,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { unreachable } from '@masknet/kit'
import { isString } from 'lodash-es'
import { FormattedCurrency, ImageIcon, TokenIcon } from '@masknet/shared'
import { GasSettingMenu } from '../GasSettingMenu/index.js'
import type { TransactionDetail } from '../../pages/Wallet/type.js'

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
        borderRadius: '50%',
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
    transaction?: TransactionDetail
    paymentToken?: string
    onConfigChange: (config: GasConfig) => void
    onPaymentTokenChange: (paymentToken: string) => void
}

export const TransactionPreview = memo<TransactionPreviewProps>(function TransactionPreview({
    transaction,
    onConfigChange,
    paymentToken,
    onPaymentTokenChange,
}) {
    const { t } = useMaskSharedI18N()
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const contacts = useContacts()
    const Others = useWeb3Others()
    const { title, to, tokenAddress, amount } = useMemo(() => {
        const type = transaction?.formattedTransaction?.type

        if (!type) return {}

        switch (type) {
            case TransactionDescriptorType.INTERACTION:
                const to = transaction.formattedTransaction?.context?.methods?.find((x) =>
                    ['transfer', 'transferFrom', 'safeTransferFrom'].includes(x.name ?? ''),
                )?.parameters?.to

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

    const tokenId = transaction?.formattedTransaction?.popup?.tokenId

    const { data: metadata } = useNonFungibleAsset(
        NetworkPluginID.PLUGIN_EVM,
        tokenId ? transaction.computedPayload.to : undefined,
        tokenId,
    )

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
                    gasOptionType: transaction.gasOptionType,
                    maxFeePerGas: transaction.computedPayload.maxFeePerGas,
                    maxPriorityFeePerGas: transaction.computedPayload.maxPriorityFeePerGas,
                }
            return
        }

        if (!transaction.computedPayload.gasPrice) return

        return {
            gasPrice: transaction.computedPayload.gasPrice,
            gasOptionType: transaction.gasOptionType,
        }
    }, [transaction?.computedPayload, transaction?.gasOptionType, isSupport1559])

    const receiver = useMemo(() => {
        if (domain) return Others.formatDomainName(domain)
        const target = contacts.find((x) => isSameAddress(x.address, to))
        return target?.name
    }, [domain, to, contacts])

    if (!transaction) return

    return (
        <Box>
            <Box className={classes.info}>
                <Box display="flex" justifyContent="space-between">
                    <Typography className={classes.title}>{title}</Typography>
                    {receiver ? <Typography className={classes.title}>{receiver}</Typography> : null}
                </Box>
                <Box mt={2} display="flex" columnGap={0.5} alignItems="center">
                    <Typography className={classes.addressTitle}>{t('to')}:</Typography>
                    <Typography fontSize={11} fontWeight={700} lineHeight="16px">
                        {to}
                    </Typography>
                </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Typography component="div" className={classes.amount}>
                    {tokenId && metadata?.collection?.iconURL ? (
                        <>
                            <ImageIcon icon={metadata.collection.iconURL} className={classes.tokenIcon} />
                            {metadata.collection.name}#{tokenId}
                        </>
                    ) : null}
                    {!tokenId ? (
                        <>
                            <TokenIcon
                                address={(tokenAddress || nativeToken?.address) ?? ''}
                                chainId={chainId}
                                name={token?.name}
                                className={classes.tokenIcon}
                            />
                            {amount
                                ? formatBalance(
                                      amount,
                                      token?.decimals,
                                      4,
                                      false,
                                      true,
                                      leftShift(amount, token?.decimals).isGreaterThan(1) ? 6 : 12,
                                  )
                                : null}
                        </>
                    ) : null}
                </Typography>
                {!isGreaterThan(tokenValueUSD, pow10(9)) && !tokenId ? (
                    <Typography className={classes.value}>
                        <FormattedCurrency
                            value={tokenValueUSD}
                            formatter={formatCurrency}
                            options={{ onlyRemainTwoOrZeroDecimal: true }}
                        />
                    </Typography>
                ) : null}
            </Box>
            <Box mt={3.75} display="flex" justifyContent="space-between" alignItems="center">
                <Typography className={classes.gasFeeTitle}>{t('popups_wallet_gas_fee')}</Typography>
                {transaction.computedPayload.gas && !!initConfig ? (
                    <GasSettingMenu
                        minimumGas={transaction.computedPayload.gas}
                        initConfig={initConfig}
                        onChange={onConfigChange}
                        paymentToken={paymentToken}
                        allowMaskAsGas={transaction.allowMaskAsGas}
                        owner={transaction.owner}
                        onPaymentTokenChange={onPaymentTokenChange}
                    />
                ) : null}
            </Box>
        </Box>
    )
})
