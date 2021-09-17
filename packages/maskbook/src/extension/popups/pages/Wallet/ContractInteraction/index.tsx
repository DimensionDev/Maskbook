import { memo, useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import {
    EthereumRpcType,
    formatBalance,
    formatGweiToWei,
    formatWeiToEther,
    getChainFromChainId,
    getChainIdFromNetworkType,
    isEIP1559Supported,
    NetworkType,
    pow10,
    useChainId,
    useERC20TokenDetailed,
    useNativeTokenDetailed,
} from '@masknet/web3-shared'
import { useValueRef, FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared'
import { Button, Link, Typography } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { LoadingButton } from '@material-ui/lab'
import { unreachable } from '@dimensiondev/kit'
import { useAsync, useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import { currentNetworkSettings } from '../../../../../plugins/Wallet/settings'
import { useLocation } from 'react-router'
import { useRejectHandler } from '../hooks/useRejectHandler'
import BigNumber from 'bignumber.js'
import { useNativeTokenPrice, useTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder'

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
    spender: {
        color: '#15181B',
        fontSize: 16,
        lineHeight: '22px',
        margin: '10px 0',
    },
    secondary: {
        color: '#7B8192',
        fontSize: 12,
        lineHeight: '16px',
        marginBottom: 10,
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
        padding: '0px 16px 20px 16px',
    },
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: '0px 16px 16px 16px',
    },
    button: {
        padding: '9px 0',
        borderRadius: 20,
        fontSize: 14,
        lineHeight: '20px',
    },
    tokenIcon: {
        width: 24,
        height: 24,
    },
    amount: {
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
}))

const ContractInteraction = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const history = useHistory()
    const chainId = useChainId()
    const networkType = useValueRef(currentNetworkSettings)
    const [transferError, setTransferError] = useState(false)
    const { value: request, loading: requestLoading } = useUnconfirmedRequest()

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
    } = useMemo(() => {
        const type = request?.computedPayload?.type
        if (!type) return {}

        switch (type) {
            case EthereumRpcType.CONTRACT_INTERACTION:
                if (request.computedPayload.name === 'approve') {
                    return {
                        isNativeTokenInteraction: false,
                        typeName: t('popups_wallet_contract_interaction_approve'),
                        tokenAddress: request.computedPayload._tx.to,
                        to: request.computedPayload._tx.to,
                        gas: request.computedPayload._tx.gas,
                        gasPrice: request.computedPayload._tx.gasPrice,
                        maxFeePerGas: request.computedPayload._tx.maxFeePerGas,
                        maxPriorityFeePerGas: request.computedPayload._tx.maxPriorityFeePerGas,
                        amount: request.computedPayload.parameters?.value,
                    }
                } else if (['transfer', 'transferFrom'].includes(request.computedPayload.name)) {
                    return {
                        isNativeTokenInteraction: false,
                        typeName: t('popups_wallet_contract_interaction_transfer'),
                        tokenAddress: request.computedPayload._tx.to,
                        to: request.computedPayload.parameters?.to,
                        gas: request.computedPayload._tx.gas,
                        gasPrice: request.computedPayload._tx.gasPrice,
                        maxFeePerGas: request.computedPayload._tx.maxFeePerGas,
                        maxPriorityFeePerGas: request.computedPayload._tx.maxPriorityFeePerGas,
                        amount: request.computedPayload.parameters?.value,
                    }
                } else {
                    return {
                        isNativeTokenInteraction: true,
                        typeName: t('popups_wallet_contract_interaction'),
                        tokenAddress: request.computedPayload._tx.to,
                        to: request.computedPayload._tx.to,
                        gas: request.computedPayload._tx.gas,
                        gasPrice: request.computedPayload._tx.gasPrice,
                        maxFeePerGas: request.computedPayload._tx.maxFeePerGas,
                        maxPriorityFeePerGas: request.computedPayload._tx.maxPriorityFeePerGas,
                        amount: request.computedPayload._tx.value,
                    }
                }
            case EthereumRpcType.SEND_ETHER:
                return {
                    isNativeTokenInteraction: true,
                    typeName: t('wallet_transfer_send'),
                    tokenAddress: request.computedPayload._tx.to,
                    to: request.computedPayload._tx.to,
                    gas: request.computedPayload._tx.gas,
                    gasPrice: request.computedPayload._tx.gasPrice,
                    maxFeePerGas: request.computedPayload._tx.maxFeePerGas,
                    maxPriorityFeePerGas: request.computedPayload._tx.maxPriorityFeePerGas,
                    amount: request.computedPayload._tx.value,
                }
            case EthereumRpcType.CONTRACT_DEPLOYMENT:
            case EthereumRpcType.ETH_DECRYPT:
            case EthereumRpcType.ETH_GET_ENCRYPTION_PUBLIC_KEY:
            case EthereumRpcType.WATCH_ASSET:
            case EthereumRpcType.WALLET_SWITCH_ETHEREUM_CHAIN:
            case EthereumRpcType.CANCEL:
            case EthereumRpcType.RETRY:
            case EthereumRpcType.SIGN:
            case EthereumRpcType.SIGN_TYPED_DATA:
                throw new Error('To be implemented.')
            default:
                unreachable(type)
        }
    }, [request, t])

    // token detailed
    const { value: nativeToken } = useNativeTokenDetailed()
    const { value: token } = useERC20TokenDetailed(isNativeTokenInteraction ? '' : tokenAddress)

    // gas price
    const { value: defaultPrices } = useAsync(async () => {
        if (networkType === NetworkType.Ethereum && !maxFeePerGas && !maxPriorityFeePerGas) {
            const response = await WalletRPC.getEstimateGasFees(chainId)
            return {
                maxPriorityFeePerGas: response?.medium.suggestedMaxPriorityFeePerGas ?? 0,
                maxFeePerGas: response?.medium.suggestedMaxFeePerGas ?? 0,
            }
        } else if (!gasPrice) {
            const response = await WalletRPC.getGasPriceDictFromDeBank(
                getChainFromChainId(chainId)?.toLowerCase() ?? '',
            )
            return {
                gasPrice: response.data.normal.price,
            }
        }
        return {}
    }, [gasPrice, maxPriorityFeePerGas, maxFeePerGas, networkType, chainId])

    // handlers
    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        if (request) {
            const toBeClose = new URLSearchParams(location.search).get('toBeClose')
            try {
                await Services.Ethereum.confirmRequest(request.payload)

                if (toBeClose) {
                    window.close()
                } else {
                    history.goBack()
                }
            } catch (error_) {
                setTransferError(true)
            }
        }
        return
    }, [request, location.search, history])

    const handleReject = useRejectHandler(() => history.replace(PopupRoutes.Wallet), request)

    // gas fee
    const gasPriceEIP1559 = maxFeePerGas
        ? new BigNumber(maxFeePerGas, 16).idiv(10 ** 9).toString()
        : formatGweiToWei(defaultPrices?.maxFeePerGas ?? 0)
    const gasPricePriorEIP1559 = (gasPrice as string) ?? defaultPrices?.gasPrice ?? 0
    const gasFee = new BigNumber(
        isEIP1559Supported(getChainIdFromNetworkType(networkType)) ? gasPriceEIP1559 : gasPricePriorEIP1559,
    )
        .multipliedBy(gas ?? 0)
        .integerValue()
        .toFixed()

    // token decimals
    const tokenAmount = (amount ?? 0) as number
    const tokenDecimals = isNativeTokenInteraction ? nativeToken?.decimals : token?.decimals

    // token estimated value
    const tokenPrice = useTokenPrice(chainId, !isNativeTokenInteraction ? token?.address : undefined)
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)
    const tokenValueUSD = new BigNumber(tokenAmount)
        .dividedBy(pow10(tokenDecimals ?? 0))
        .times((!isNativeTokenInteraction ? tokenPrice : nativeTokenPrice) ?? 0)
        .toString()

    const totalUSD = new BigNumber(formatWeiToEther(gasFee)).times(nativeTokenPrice).plus(tokenValueUSD).toString()

    console.log('DEBUG: ContractInteraction')
    console.log({
        amount,
        gasFee,
        gas,
        maxPriorityFeePerGas: maxPriorityFeePerGas ?? defaultPrices?.maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas ?? defaultPrices?.maxFeePerGas,
        defaultPrice: (gasPrice as string) ?? defaultPrices?.gasPrice,
        request,
        tokenPrice,
        tokenAmount,
        tokenDecimals,
        nativeTokenPrice,
    })

    return requestLoading ? (
        <LoadingPlaceholder />
    ) : (
        <main className={classes.container}>
            <div className={classes.info}>
                <Typography className={classes.title}>{typeName}</Typography>
                <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                    {to}
                </Typography>
            </div>
            <div className={classes.content}>
                <div className={classes.item} style={{ marginTop: 20, marginBottom: 30 }}>
                    <TokenIcon
                        address={(isNativeTokenInteraction ? nativeToken?.address : token?.address) ?? ''}
                        classes={{ icon: classes.tokenIcon }}
                    />
                    {tokenDecimals !== undefined ? (
                        <>
                            <Typography className={classes.amount}>
                                {new BigNumber(formatBalance(tokenAmount, tokenDecimals)).isGreaterThan(10 ** 9) ? (
                                    new BigNumber(formatBalance(tokenAmount, tokenDecimals)).toPrecision(3)
                                ) : (
                                    <FormattedBalance value={tokenAmount} decimals={tokenDecimals} significant={4} />
                                )}
                            </Typography>
                            <Typography>
                                {new BigNumber(tokenValueUSD).isGreaterThan(10 ** 9) ? (
                                    new BigNumber(tokenValueUSD).toPrecision(3)
                                ) : (
                                    <FormattedCurrency value={tokenValueUSD} sign="$" />
                                )}
                            </Typography>
                        </>
                    ) : null}
                </div>

                <div className={classes.item}>
                    <Typography className={classes.label}>{t('popups_wallet_contract_interaction_gas_fee')}</Typography>
                    <Typography className={classes.gasPrice}>
                        <FormattedBalance
                            value={gasFee}
                            decimals={nativeToken?.decimals}
                            significant={4}
                            symbol={nativeToken?.symbol}
                        />
                        <Link
                            component="button"
                            onClick={() => history.push(PopupRoutes.GasSetting)}
                            style={{ marginLeft: 10, fontSize: 'inherit', lineHeight: 'inherit' }}>
                            {t('popups_wallet_contract_interaction_edit')}
                        </Link>
                    </Typography>
                </div>

                <div className={classes.item} style={{ marginTop: 10 }}>
                    <Typography className={classes.label}>{t('popups_wallet_contract_interaction_total')}</Typography>
                    <Typography className={classes.gasPrice}>
                        {new BigNumber(totalUSD).isGreaterThan(10 ** 9) ? (
                            new BigNumber(totalUSD).toPrecision(3)
                        ) : (
                            <FormattedCurrency value={totalUSD} sign="$" />
                        )}
                    </Typography>
                </div>
            </div>
            {transferError ? (
                <Typography className={classes.error}>{t('popups_wallet_transfer_error_tip')}</Typography>
            ) : null}
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                    onClick={handleReject}>
                    {t('cancel')}
                </Button>
                <LoadingButton loading={loading} variant="contained" className={classes.button} onClick={handleConfirm}>
                    {transferError ? t('popups_wallet_re_send') : t('confirm')}
                </LoadingButton>
            </div>
        </main>
    )
})

export default ContractInteraction
