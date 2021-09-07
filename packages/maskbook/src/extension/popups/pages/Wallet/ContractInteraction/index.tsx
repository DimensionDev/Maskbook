import { memo, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import {
    EthereumRpcType,
    formatWeiToEther,
    getChainFromChainId,
    NetworkType,
    useChainId,
    useNativeTokenDetailed,
} from '@masknet/web3-shared'
import { Button, Link, Typography } from '@material-ui/core'
import { useI18N, useValueRef } from '../../../../../utils'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { LoadingButton } from '@material-ui/lab'
import { useAsync, useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import { FormattedCurrency, TokenIcon } from '@masknet/shared'
import BigNumber from 'bignumber.js'
import { currentNetworkSettings } from '../../../../../plugins/Wallet/settings'
import { useLocation } from 'react-router'
import { useRejectHandler } from '../hooks/useRejectHandler'

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
        padding: '0 10px',
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
    controller: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 20,
        padding: 16,
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
    const { value } = useUnconfirmedRequest()
    const networkType = useValueRef(currentNetworkSettings)
    const chainId = useChainId()
    const { typeName, spender, to, gasPrice, maxFeePerGas, maxPriorityFeePerGas, amount } = useMemo(() => {
        if (value?.computedPayload?.type) {
            switch (value.computedPayload.type) {
                case EthereumRpcType.CONTRACT_INTERACTION:
                    if (value.computedPayload.name === 'approve') {
                        return {
                            typeName: t('popups_wallet_contract_interaction_approve'),
                            spender: value.computedPayload.parameters?.spender,
                            to: value.computedPayload._tx.to,
                            gasPrice: value.computedPayload._tx.gasPrice,
                            maxFeePerGas: value.computedPayload._tx.maxFeePerGas,
                            maxPriorityFeePerGas: value.computedPayload._tx.maxPriorityFeePerGas,
                            amount: value.computedPayload.parameters?.value,
                        }
                    } else {
                        // ERC20 Transfer and other contract interaction
                        return {
                            typeName: t('wallet_transfer_send'),
                            spender: value.computedPayload._tx.from,
                            to: value.computedPayload._tx.to,
                            gasPrice: value.computedPayload._tx.gasPrice,
                            maxFeePerGas: value.computedPayload._tx.maxFeePerGas,
                            maxPriorityFeePerGas: value.computedPayload._tx.maxPriorityFeePerGas,
                            amount: value.computedPayload.parameters?.value,
                        }
                    }
                case EthereumRpcType.SEND_ETHER:
                    return {
                        typeName: t('wallet_transfer_send'),
                        spender: value.computedPayload._tx.from,
                        to: value.computedPayload._tx.to,
                        gasPrice: value.computedPayload._tx.gasPrice,
                        maxFeePerGas: value.computedPayload._tx.maxFeePerGas,
                        maxPriorityFeePerGas: value.computedPayload._tx.maxPriorityFeePerGas,
                        amount: value.computedPayload._tx.value,
                    }
                default:
                    throw new Error('To be implemented')
            }
        }
        return {}
    }, [value, t])

    // const { value: token } = useERC20TokenDetailed(to)
    const { value: nativeToken } = useNativeTokenDetailed()
    //
    // const { value: tokenPrices } = useAsync(async () => {
    //     const coinList = await getAllCoins()
    //
    //     const tokenId = coinList?.find((coin) => coin.symbol === token?.symbol)?.id
    //     const nativeTokenId = coinList?.find((coin) => coin.symbol === nativeToken?.symbol)?.id
    //
    //     if (!tokenId || !nativeTokenId)
    //         return {
    //             tokenPRice: 0,
    //             nativeTokenPrice: 0,
    //         }
    //
    //     const tokenPrice = await fetchTokenPrice(tokenId)
    //     const nativeTokenPrice = await fetchTokenPrice(nativeTokenId)
    //
    //     return {
    //         tokenPrice,
    //         nativeTokenPrice,
    //     }
    // }, [token, nativeToken, value])
    //
    // const { tokenValueUSD, totalUSD } = useMemo(() => {
    //     const tokenValueUSD = new BigNumber((amount ?? 0) as number).times(tokenPrices?.tokenPrice ?? 0).toString()
    //
    //     const totalUSD = formatWeiToEther(gasPrice as number)
    //         .times(tokenPrices?.nativeTokenPrice ?? 0)
    //         .plus(tokenValueUSD)
    //
    //     return {
    //         tokenValueUSD,
    //         totalUSD,
    //     }
    // }, [tokenPrices, gasPrice, amount])

    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        if (value) {
            const toBeClose = new URLSearchParams(location.search).get('toBeClose')
            await WalletRPC.deleteUnconfirmedRequest(value.payload)
            await Services.Ethereum.confirmRequest(value.payload)

            if (toBeClose) {
                window.close()
            } else {
                history.replace(PopupRoutes.TokenDetail)
            }
        }
    }, [value, location.search, history])

    const handleReject = useRejectHandler(() => history.replace(PopupRoutes.Wallet), value)

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

    return (
        <main className={classes.container}>
            <div className={classes.info}>
                <Typography className={classes.title}>{typeName}</Typography>
                <Typography className={classes.spender} style={{ wordBreak: 'break-all' }}>
                    {spender}
                </Typography>
                <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                    {to}
                </Typography>
            </div>
            <div className={classes.content}>
                <div className={classes.item} style={{ marginTop: 20, marginBottom: 30 }}>
                    <TokenIcon
                        address={
                            (value?.computedPayload?.type === EthereumRpcType.SEND_ETHER ? nativeToken?.address : to) ??
                            ''
                        }
                        classes={{ icon: classes.tokenIcon }}
                    />
                    <Typography className={classes.amount}>{amount}</Typography>
                    <Typography>
                        <FormattedCurrency value={280} sign="$" />
                    </Typography>
                </div>
                {networkType !== NetworkType.Ethereum ? (
                    <div className={classes.item}>
                        <Typography className={classes.label}>
                            {t('popups_wallet_contract_interaction_gas_fee')}
                        </Typography>
                        <Typography className={classes.gasPrice}>
                            <span>
                                {formatWeiToEther(
                                    new BigNumber((gasPrice as string) ?? defaultPrices?.gasPrice ?? 0).toNumber(),
                                ).toString(10)}
                                {nativeToken?.symbol}
                            </span>
                            <Link
                                component="button"
                                onClick={() => history.push(PopupRoutes.GasSetting)}
                                style={{ marginLeft: 10, fontSize: 'inherit', lineHeight: 'inherit' }}>
                                {t('popups_wallet_contract_interaction_edit')}
                            </Link>
                        </Typography>
                    </div>
                ) : (
                    <>
                        <div className={classes.item}>
                            <Typography className={classes.label}>
                                {t('popups_wallet_gas_fee_settings_max_priority_fee')}
                            </Typography>
                            <Typography className={classes.gasPrice}>
                                <span>
                                    {formatWeiToEther(
                                        new BigNumber(
                                            maxPriorityFeePerGas ?? defaultPrices?.maxPriorityFeePerGas ?? 0,
                                        ).toNumber(),
                                    ).toString(10)}
                                    {nativeToken?.symbol}
                                </span>
                            </Typography>
                        </div>
                        <div className={classes.item}>
                            <Typography className={classes.label}>
                                {t('popups_wallet_gas_fee_settings_max_fee')}
                            </Typography>
                            <Typography className={classes.gasPrice}>
                                <span>
                                    {formatWeiToEther(
                                        new BigNumber(maxFeePerGas ?? defaultPrices?.maxFeePerGas ?? 0).toNumber(),
                                    ).toString(10)}
                                    {nativeToken?.symbol}
                                </span>
                                <Link
                                    component="button"
                                    onClick={() => history.push(PopupRoutes.GasSetting)}
                                    style={{ marginLeft: 10, fontSize: 'inherit', lineHeight: 'inherit' }}>
                                    {t('popups_wallet_contract_interaction_edit')}
                                </Link>
                            </Typography>
                        </div>
                    </>
                )}
                <div className={classes.item} style={{ marginTop: 10 }}>
                    <Typography className={classes.label}>{t('popups_wallet_contract_interaction_total')}</Typography>
                    <Typography className={classes.gasPrice}>
                        <FormattedCurrency value={280} sign="$" />
                    </Typography>
                </div>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                    onClick={handleReject}>
                    {t('cancel')}
                </Button>
                <LoadingButton loading={loading} variant="contained" className={classes.button} onClick={handleConfirm}>
                    {t('confirm')}
                </LoadingButton>
            </div>
        </main>
    )
})

export default ContractInteraction
