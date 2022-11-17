import { memo, useMemo, useState } from 'react'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest.js'
import { formatGweiToWei, formatWeiToEther, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared'
import { Link, Typography } from '@mui/material'
import { useI18N } from '../../../../../utils/index.js'
import { PopupRoutes, NetworkPluginID } from '@masknet/shared-base'
import { LoadingButton } from '@mui/lab'
import { unreachable } from '@masknet/kit'
import { BigNumber } from 'bignumber.js'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder/index.js'
import { toHex } from 'web3-utils'
import {
    useChainContext,
    useChainIdSupport,
    useFungibleToken,
    useFungibleTokenPrice,
    useGasOptions,
    useNativeToken,
    useNativeTokenPrice,
    useReverseAddress,
    useWeb3State,
} from '@masknet/web3-hooks-base'
import {
    formatBalance,
    formatCurrency,
    isGreaterThan,
    leftShift,
    pow10,
    TransactionDescriptorType,
} from '@masknet/web3-shared-base'
import { CopyIconButton } from '../../../components/CopyIconButton/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { WalletRPC } from '../../../../../plugins/Wallet/messages.js'

const useStyles = makeStyles()(() => ({
    container: {
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
    info: {
        backgroundColor: '#F7F9FA',
        padding: 10,
        borderRadius: 8,
    },
    title: {
        color: '#15181B',
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 500,
    },
    secondary: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 10,
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        lineHeight: '16px',
        color: '#7B8192',
    },
    error: {
        color: '#FF5F5F',
        fontSize: 12,
        lineHeight: '16px',
        padding: '0 16px 20px 16px',
        wordBreak: 'break-all',
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: '0 16px 16px 16px',
    },
    button: {
        fontWeight: 600,
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    tokenIcon: {
        width: 24,
        height: 24,
    },
    tokenDescription: {
        flex: 1,
        fontSize: 18,
        color: '#15181B',
        lineHeight: '24px',
        fontWeight: 500,
        margin: '0 10px',
        wordBreak: 'break-all',
    },
    gasPrice: {
        fontSize: 12,
        lineHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        color: '#15181B',
    },
    bottom: {
        position: 'fixed',
        bottom: 0,
        width: '100%',
    },
    domain: {
        fontSize: 16,
        lineHeight: '22px',
        fontWeight: 500,
        color: '#15181B',
        margin: '10px 0',
    },
    copy: {
        width: 12,
        height: 12,
        color: '#7B8192',
        cursor: 'pointer',
    },
}))

const ContractInteraction = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()
    const { Others, TransactionFormatter } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { chainId, networkType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const [transferError, setTransferError] = useState(false)
    const { value: request, loading: requestLoading } = useUnconfirmedRequest()
    const { value: transactionDescription } = useAsync(async () => {
        if (!request?.transactionContext?.chainId) return
        return TransactionFormatter?.formatTransaction?.(request?.transactionContext?.chainId, {
            ...request?.transactionContext,
            data: request?.computedPayload?.data,
        })
    }, [TransactionFormatter, request])

    const {
        tokenAddress,
        typeName,
        to,
        gas,
        gasPrice,
        maxFeePerGas,
        maxPriorityFeePerGas,
        amount,
        isNativeTokenInteraction,
        tokenDescription,
    } = useMemo(() => {
        const type = request?.formatterTransaction?.type
        if (!type) return {}

        switch (type) {
            case TransactionDescriptorType.INTERACTION:
                return {
                    isNativeTokenInteraction: transactionDescription?.tokenInAddress
                        ? isNativeTokenAddress(transactionDescription?.tokenInAddress)
                        : true,
                    typeName: transactionDescription?.title ?? t('popups_wallet_contract_interaction'),
                    tokenAddress: transactionDescription?.tokenInAddress,
                    tokenDescription: transactionDescription?.popup?.tokenDescription,
                    to: request.computedPayload?.to,
                    gas: request.computedPayload?.gas,
                    gasPrice: request.computedPayload?.gasPrice,
                    maxFeePerGas: request.computedPayload?.maxFeePerGas,
                    maxPriorityFeePerGas: request.computedPayload?.maxPriorityFeePerGas,
                    amount: transactionDescription?.tokenInAmount ?? request.computedPayload?.value,
                }
            case TransactionDescriptorType.TRANSFER:
                return {
                    isNativeTokenInteraction: true,
                    typeName: t('wallet_transfer_send'),
                    tokenAddress: request.computedPayload?.to,
                    to: request.computedPayload?.to,
                    gas: request.computedPayload?.gas,
                    gasPrice: request.computedPayload?.gasPrice,
                    maxFeePerGas: request.computedPayload?.maxFeePerGas,
                    maxPriorityFeePerGas: request.computedPayload?.maxPriorityFeePerGas,
                    amount: request.computedPayload?.value,
                }
            case TransactionDescriptorType.DEPLOYMENT:
            case TransactionDescriptorType.RETRY:
            case TransactionDescriptorType.CANCEL:
                throw new Error('Method not implemented.')
            default:
                unreachable(type)
        }
    }, [request, t, transactionDescription])

    // token detailed
    const { value: nativeToken } = useNativeToken(NetworkPluginID.PLUGIN_EVM)
    const { value: token } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, !isNativeTokenInteraction ? tokenAddress : '')

    // gas price
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)
    const { value: gasOptions } = useGasOptions(NetworkPluginID.PLUGIN_EVM)
    const { value: defaultPrices } = useAsync(async () => {
        if (isSupport1559 && !maxFeePerGas && !maxPriorityFeePerGas) {
            // Gwei to wei
            return {
                maxPriorityFeePerGas: toHex(
                    formatGweiToWei(gasOptions?.normal.suggestedMaxPriorityFeePerGas ?? 0).toFixed(0),
                ),
                maxFeePerGas: toHex(formatGweiToWei(gasOptions?.normal.suggestedMaxFeePerGas ?? 0).toFixed(0)),
            }
        } else if (!gasPrice) {
            return {
                gasPrice: gasOptions?.normal.suggestedMaxFeePerGas ?? 0,
            }
        }
        return {}
    }, [gasPrice, maxPriorityFeePerGas, maxFeePerGas, networkType, chainId, gasOptions, isSupport1559])

    // handlers
    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        if (request) {
            try {
                await WalletRPC.confirmRequest(request.payload, { chainId })
                navigate(-1)
            } catch (error_) {
                setTransferError(true)
            }
        }
        return
    }, [request, location.search, history, chainId])

    const [{ loading: rejectLoading }, handleReject] = useAsyncFn(async () => {
        if (!request) return
        await WalletRPC.rejectRequest(request.payload)
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [request])

    // Wei
    const gasPriceEIP1559 = new BigNumber((maxFeePerGas as number) ?? defaultPrices?.maxFeePerGas ?? 0, 16)
    const gasPricePriorEIP1559 = new BigNumber((gasPrice as string) ?? defaultPrices?.gasPrice ?? 0)
    const gasFee = (isSupport1559 ? gasPriceEIP1559 : gasPricePriorEIP1559)
        .multipliedBy(gas ?? 0)
        .integerValue()
        .toFixed()

    // token decimals
    const tokenAmount = (amount ?? 0) as number
    const tokenDecimals = token?.decimals

    // token estimated value
    const { value: tokenPrice } = useFungibleTokenPrice(NetworkPluginID.PLUGIN_EVM, token?.address, {
        chainId,
    })

    const { value: nativeTokenPrice } = useNativeTokenPrice(NetworkPluginID.PLUGIN_EVM)

    const tokenValueUSD = leftShift(tokenAmount, tokenDecimals)
        .times((!isNativeTokenInteraction ? tokenPrice : nativeTokenPrice) ?? 0)
        .toString()

    const totalUSD = new BigNumber(formatWeiToEther(gasFee))
        .times(nativeTokenPrice ?? 0)
        .plus(tokenValueUSD)
        .toString()

    useUpdateEffect(() => {
        if (!request && !requestLoading) {
            navigate(PopupRoutes.Wallet, { replace: true })
        }
    }, [request, requestLoading])

    useTitle(typeName ?? t('popups_wallet_contract_interaction'))
    const { value: domain } = useReverseAddress(NetworkPluginID.PLUGIN_EVM, to)

    return requestLoading ? (
        <LoadingPlaceholder />
    ) : (
        <>
            <main className={classes.container}>
                <div className={classes.info} style={{ marginBottom: 20 }}>
                    <Typography className={classes.title}>{typeName}</Typography>
                    {domain && Others?.formatDomainName ? (
                        <Typography className={classes.domain}>{Others?.formatDomainName(domain)}</Typography>
                    ) : null}
                    <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                        {to}
                        {request?.formatterTransaction?.type === TransactionDescriptorType.INTERACTION &&
                        request?.transactionContext?.methods?.some((x) => x.name === 'approve') &&
                        to ? (
                            <CopyIconButton text={to} className={classes.copy} />
                        ) : null}
                    </Typography>
                </div>
                <div className={classes.content}>
                    {tokenAddress ? (
                        <div className={classes.item} style={{ marginBottom: 30 }}>
                            <TokenIcon
                                address={(isNativeTokenInteraction ? nativeToken?.address : token?.address) ?? ''}
                                chainId={chainId}
                                name={(isNativeTokenInteraction ? nativeToken?.name : token?.name) ?? ''}
                                className={classes.tokenIcon}
                            />
                            {tokenDescription ? (
                                <Typography className={classes.tokenDescription}>{tokenDescription}</Typography>
                            ) : tokenDecimals !== undefined ? (
                                <>
                                    <Typography className={classes.tokenDescription}>
                                        <FormattedBalance
                                            value={tokenAmount}
                                            decimals={tokenDecimals}
                                            significant={4}
                                            formatter={formatBalance}
                                        />
                                    </Typography>
                                    <Typography>
                                        {!isGreaterThan(tokenValueUSD, pow10(9)) ? (
                                            <FormattedCurrency value={tokenValueUSD} formatter={formatCurrency} />
                                        ) : null}
                                    </Typography>
                                </>
                            ) : null}
                        </div>
                    ) : null}

                    <div className={classes.item}>
                        <Typography className={classes.label}>
                            {t('popups_wallet_contract_interaction_gas_fee')}
                        </Typography>
                        <Typography className={classes.gasPrice}>
                            <FormattedBalance
                                value={gasFee}
                                decimals={nativeToken?.decimals}
                                significant={4}
                                symbol={nativeToken?.symbol}
                                formatter={formatBalance}
                            />
                            <Link
                                component="button"
                                onClick={() => navigate(PopupRoutes.GasSetting)}
                                style={{ marginLeft: 10, fontSize: 'inherit', lineHeight: 'inherit' }}>
                                {t('popups_wallet_contract_interaction_edit')}
                            </Link>
                        </Typography>
                    </div>

                    {!isGreaterThan(totalUSD, pow10(9)) ? (
                        <div className={classes.item} style={{ marginTop: 10 }}>
                            <Typography className={classes.label}>
                                {t('popups_wallet_contract_interaction_total')}
                            </Typography>

                            <Typography className={classes.gasPrice}>
                                <FormattedCurrency value={totalUSD} formatter={formatCurrency} />
                            </Typography>
                        </div>
                    ) : null}
                </div>
            </main>
            <div className={classes.bottom}>
                {transferError ? (
                    <Typography className={classes.error}>{t('popups_wallet_transfer_error_tip')}</Typography>
                ) : null}
                <div className={classes.controller}>
                    <LoadingButton
                        loading={rejectLoading}
                        variant="contained"
                        className={classes.button}
                        style={!rejectLoading ? { backgroundColor: '#F7F9FA', color: '#1C68F3' } : undefined}
                        onClick={handleReject}>
                        {t('cancel')}
                    </LoadingButton>
                    <LoadingButton
                        loading={loading}
                        variant="contained"
                        className={classes.button}
                        onClick={handleConfirm}>
                        {transferError ? t('popups_wallet_re_send') : t('confirm')}
                    </LoadingButton>
                </div>
            </div>
        </>
    )
})

export default ContractInteraction
