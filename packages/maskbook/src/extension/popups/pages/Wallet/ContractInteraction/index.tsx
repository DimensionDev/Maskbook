import { memo, useMemo } from 'react'
import { makeStyles } from '@masknet/theme'
import { useUnconfirmedRequest } from '../hooks/useUnConfirmedRequest'
import { EthereumRpcType, formatWeiToEther, useERC20TokenDetailed, useNativeTokenDetailed } from '@masknet/web3-shared'
import { Typography, Link, Button } from '@material-ui/core'
import { useI18N } from '../../../../../utils'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../index'
import { LoadingButton } from '@material-ui/lab'
import { useAsync, useAsyncFn } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'
import Services from '../../../../service'
import { FormattedCurrency, TokenIcon } from '@masknet/shared'
import { fetchTokenPrice } from '../../../../../plugins/Wallet/apis/coingecko'
import BigNumber from 'bignumber.js'
import { getAllCoins } from '../../../../../plugins/Trader/apis/coingecko'

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
    const history = useHistory()
    const { value } = useUnconfirmedRequest()

    const { spender, to, gasPrice, amount } = useMemo(() => {
        if (
            value?.computedPayload?.type === EthereumRpcType.CONTRACT_INTERACTION &&
            value.computedPayload.name === 'approve'
        ) {
            const spender = value.computedPayload.parameters?.spender
            const amount = value.computedPayload.parameters?.value

            const { gasPrice, to } = value.computedPayload._tx
            return {
                spender,
                gasPrice,
                to,
                amount,
            }
        }
        return {
            spender: '',
            gasPrice: 0,
            to: '',
            amount: 0,
        }
    }, [value])

    const { value: token } = useERC20TokenDetailed(to)
    const { value: nativeToken } = useNativeTokenDetailed()

    const { value: tokenPrices } = useAsync(async () => {
        const coinList = await getAllCoins()

        const tokenId = coinList?.find((coin) => coin.symbol === token?.symbol)?.id
        const nativeTokenId = coinList?.find((coin) => coin.symbol === nativeToken?.symbol)?.id

        if (!tokenId || !nativeTokenId)
            return {
                tokenPRice: 0,
                nativeTokenPrice: 0,
            }

        const tokenPrice = await fetchTokenPrice(tokenId)
        const nativeTokenPrice = await fetchTokenPrice(nativeTokenId)

        return {
            tokenPrice,
            nativeTokenPrice,
        }
    }, [token, nativeToken])

    const { tokenValueUSD, totalUSD } = useMemo(() => {
        const tokenValueUSD = new BigNumber(amount ?? 0).times(tokenPrices?.tokenPrice ?? 0).toString()

        const totalUSD = formatWeiToEther(gasPrice as number)
            .times(tokenPrices?.nativeTokenPrice ?? 0)
            .plus(tokenValueUSD)

        return {
            tokenValueUSD,
            totalUSD,
        }
    }, [tokenPrices, gasPrice, amount])

    const [{ loading }, handleConfirm] = useAsyncFn(async () => {
        if (value) {
            await WalletRPC.deleteUnconfirmedRequest(value.payload)
            await Services.Ethereum.request(value.payload, { skipConfirmation: true })
        }
    }, [value])

    return (
        <main className={classes.container}>
            <div className={classes.info}>
                <Typography className={classes.title}>{t('popups_wallet_contract_interaction_approve')}</Typography>
                <Typography className={classes.spender}>{spender}</Typography>
                <Typography className={classes.secondary} style={{ wordBreak: 'break-all' }}>
                    {to}
                </Typography>
            </div>
            <div className={classes.content}>
                <div className={classes.item} style={{ marginTop: 20, marginBottom: 30 }}>
                    <TokenIcon address={to ?? ''} classes={{ icon: classes.tokenIcon }} />
                    <Typography className={classes.amount}>{amount}</Typography>
                    <Typography>
                        <FormattedCurrency value={tokenValueUSD} sign="$" />
                    </Typography>
                </div>
                <div className={classes.item}>
                    <Typography className={classes.label}>{t('popups_wallet_contract_interaction_gas_fee')}</Typography>
                    <Typography className={classes.gasPrice}>
                        <span>
                            {formatWeiToEther(gasPrice as number).toString()} {nativeToken?.symbol}
                        </span>
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
                        <FormattedCurrency value={totalUSD} sign="$" />
                    </Typography>
                </div>
            </div>
            <div className={classes.controller}>
                <Button
                    variant="contained"
                    className={classes.button}
                    style={{ backgroundColor: '#F7F9FA', color: '#1C68F3' }}
                    onClick={() => window.close()}>
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
