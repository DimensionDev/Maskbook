import { memo, useMemo, useState } from 'react'
import { useAsync, useAsyncFn, useUpdateEffect } from 'react-use'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from '@masknet/theme'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import {
    EthereumRpcType,
    EthereumTokenType,
    formatBalance,
    formatCurrency,
    formatGweiToWei,
    formatWeiToEther,
    getChainIdFromNetworkType,
    isEIP1559Supported,
    useChainId,
    useERC20TokenDetailed,
    useEthereumTokenType,
    useNativeTokenDetailed,
    useNetworkType,
} from '@masknet/web3-shared-evm'
import { FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared'
import { Link, Typography } from '@mui/material'
import { useI18N } from '../../../../../utils'
import { PopupRoutes } from '@masknet/shared-base'
import { LoadingButton } from '@mui/lab'
import { unreachable } from '@dimensiondev/kit'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import BigNumber from 'bignumber.js'
import { useNativeTokenPrice, useTokenPrice } from '../../../../../plugins/Wallet/hooks/useTokenPrice'
import { LoadingPlaceholder } from '../../../components/LoadingPlaceholder'
import { toHex } from 'web3-utils'
import { NetworkPluginID, useReverseAddress, useWeb3State } from '@masknet/plugin-infra/web3'
import { isGreaterThan, leftShift, pow10, ZERO } from '@masknet/web3-shared-base'
import { CopyIconButton } from '../../../components/CopyIconButton'
import { useTitle } from '../../../hook/useTitle'

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
        fontSize: 12,
        fill: '#7B8192',
        cursor: 'pointer',
    },
}))

const ContractInteraction = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const location = useLocation()
    const navigate = useNavigate()
    const chainId = useChainId()
    const networkType = useNetworkType()
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
        contractAddress,
    } = useMemo(() => {
        const type = request?.computedPayload?.type
        if (!type) return {}

        switch (type) {
            case EthereumRpcType.CONTRACT_INTERACTION:
                switch (request.computedPayload.name) {
                    case 'approve':
                        return {
                            isNativeTokenInteraction: false,
                            typeName: t('popups_wallet_token_unlock_permission'),
                            tokenAddress: request.computedPayload._tx.to,
                            to: request.computedPayload._tx.to,
                            gas: request.computedPayload._tx.gas,
                            gasPrice: request.computedPayload._tx.gasPrice,
                            maxFeePerGas: request.computedPayload._tx.maxFeePerGas,
                            maxPriorityFeePerGas: request.computedPayload._tx.maxPriorityFeePerGas,
                            amount: request.computedPayload.parameters?.value,
                        }
                    case 'transfer':
                    case 'transferFrom':
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
                            contractAddress: request.computedPayload._tx.to,
                        }
                    default:
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

    const contractType = useEthereumTokenType(contractAddress)

    // token detailed
    const { value: nativeToken } = useNativeTokenDetailed()
    const { value: token } = useERC20TokenDetailed(isNativeTokenInteraction ? '' : tokenAddress)

    // gas price
    const { value: defaultPrices } = useAsync(async () => {
        if (isEIP1559Supported(chainId) && !maxFeePerGas && !maxPriorityFeePerGas) {
            const response = await WalletRPC.getEstimateGasFees(chainId)
            // Gwei to wei
            return {
                maxPriorityFeePerGas: toHex(
                    formatGweiToWei(response?.medium?.suggestedMaxPriorityFeePerGas ?? 0).toFixed(0),
                ),
                maxFeePerGas: toHex(formatGweiToWei(response?.medium?.suggestedMaxFeePerGas ?? 0).toFixed(0)),
            }
        } else if (!gasPrice) {
            const response = await WalletRPC.getGasPriceDictFromDeBank(chainId)
            return {
                gasPrice: response?.data.normal.price ?? 0,
            }
        }
        return {}
    }, [gasPrice, maxPriorityFeePerGas, maxFeePerGas, networkType, chainId])

    // handlers
    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        if (request) {
            try {
                await Services.Ethereum.confirmRequest(request.payload)
                navigate(-1)
            } catch (error_) {
                setTransferError(true)
            }
        }
        return
    }, [request, location.search, history])

    const [{ loading: rejectLoading }, handleReject] = useAsyncFn(async () => {
        if (!request) return
        await Services.Ethereum.rejectRequest(request.payload)
        navigate(PopupRoutes.Wallet, { replace: true })
    }, [request])

    // Wei
    const gasPriceEIP1559 = new BigNumber(maxFeePerGas ?? defaultPrices?.maxFeePerGas ?? 0, 16)
    const gasPricePriorEIP1559 = new BigNumber((gasPrice as string) ?? defaultPrices?.gasPrice ?? 0)
    const gasFee = (isEIP1559Supported(getChainIdFromNetworkType(networkType)) ? gasPriceEIP1559 : gasPricePriorEIP1559)
        .multipliedBy(gas ?? 0)
        .integerValue()
        .toFixed()

    // token decimals
    const tokenAmount = (amount ?? 0) as number
    const tokenDecimals = isNativeTokenInteraction ? nativeToken?.decimals : token?.decimals

    // token estimated value
    const tokenPrice = useTokenPrice(chainId, !isNativeTokenInteraction ? token?.address : undefined)
    const nativeTokenPrice = useNativeTokenPrice(nativeToken?.chainId)
    const tokenValueUSD =
        contractType && [EthereumTokenType.ERC721, EthereumTokenType.ERC1155].includes(contractType)
            ? ZERO
            : leftShift(tokenAmount, tokenDecimals)
                  .times((!isNativeTokenInteraction ? tokenPrice : nativeTokenPrice) ?? 0)
                  .toString()

    const totalUSD = new BigNumber(formatWeiToEther(gasFee)).times(nativeTokenPrice).plus(tokenValueUSD).toString()
    //
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

    useUpdateEffect(() => {
        if (!request && !requestLoading) {
            navigate(PopupRoutes.Wallet, { replace: true })
        }
    }, [request, requestLoading])

    useTitle(typeName ?? t('popups_wallet_contract_interaction'))

    const { value: domain } = useReverseAddress(to, NetworkPluginID.PLUGIN_EVM)
    const { Utils } = useWeb3State()
    return requestLoading ? (
        <LoadingPlaceholder />
    ) : (
        <>
            <main className={classes.container}>
                <div className={classes.info}>
                    <Typography className={classes.title}>{typeName}</Typography>
                    {domain && Utils?.formatDomainName ? (
                        <Typography className={classes.domain}>{Utils?.formatDomainName(domain)}</Typography>
                    ) : null}
                    <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                        {to}
                        {request?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION &&
                        request.computedPayload.name === 'approve' &&
                        to ? (
                            <CopyIconButton text={to} className={classes.copy} />
                        ) : null}
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
                                    {isGreaterThan(formatBalance(tokenAmount, tokenDecimals), pow10(9)) ? (
                                        t('popups_wallet_token_infinite_unlock')
                                    ) : (
                                        <FormattedBalance
                                            value={tokenAmount}
                                            decimals={tokenDecimals}
                                            significant={4}
                                            formatter={formatBalance}
                                        />
                                    )}
                                </Typography>
                                <Typography>
                                    {!isGreaterThan(tokenValueUSD, pow10(9)) ? (
                                        <FormattedCurrency value={tokenValueUSD} sign="$" formatter={formatCurrency} />
                                    ) : null}
                                </Typography>
                            </>
                        ) : null}
                    </div>

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
                                <FormattedCurrency value={totalUSD} sign="$" formatter={formatCurrency} />
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
