import { useCallback, useMemo, useState } from 'react'
import { Grid, makeStyles, Paper, Typography, useTheme } from '@material-ui/core'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared'
import {
    formatBalance,
    formatWeiToGwei,
    EthereumTokenType,
    getChainDetailed,
    useChainId,
    useGasPrice,
    GasNow,
    ChainId,
} from '@masknet/web3-shared'
import { useI18N } from '../../utils'
import { Image } from '../../components/shared/Image'
import { useAssets } from '../../plugins/Wallet/hooks/useAssets'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { currentGasNowSettings } from '../../plugins/Wallet/settings'

const useStyles = makeStyles(() => {})

interface TxFeeEstimationProps extends withClasses<'label' | 'button' | 'data' | 'gasEstimation'> {
    gas?: number
}
const TUNE_ICON_DARK_MODE = new URL('../assets/tune_dark_mode.png', import.meta.url).toString()
const TUNE_ICON_LIGHT_MODE = new URL('../assets/tune_light_mode.png', import.meta.url).toString()

export function TxFeeEstimation(props: TxFeeEstimationProps) {
    const { t } = useI18N()
    const theme = useTheme()
    const { gas } = props
    const _gasPrice = useGasPrice()
    const classes = useStylesExtends(useStyles(), props)
    const gasNow = useValueRef(currentGasNowSettings)
    const [type, setType] = useState<keyof GasNow>('fast')
    const chainId = useChainId()
    const chainDetailed = getChainDetailed(chainId)

    const { setDialog: setGasPriceDialog } = useRemoteControlledDialog(
        WalletMessages.events.gasPriceDialogUpdated,
        useCallback(
            (ev) => {
                if (ev.open || !ev.type) return
                setType(ev.type)
            },
            [_gasPrice],
        ),
    )

    const gasPrice = useMemo(
        () => formatWeiToGwei(type === 'custom' ? _gasPrice : gasNow ? gasNow[type] : 0),
        [type, _gasPrice, gasNow],
    )

    const { value: detailedTokens } = useAssets([])
    const nativeToken = detailedTokens.find((t) => t.token.type === EthereumTokenType.Native)
    const usdRate = nativeToken?.price?.usd
    return chainId === ChainId.Mainnet && gas ? (
        <>
            <Grid item xs={6}>
                <Paper className={classes.label}>
                    <Typography>{t('gas_fee')}</Typography>
                </Paper>
            </Grid>
            <Grid item xs={6}>
                <Paper className={classes.data}>
                    <div className={classes.gasEstimation} onClick={() => setGasPriceDialog({ open: true })}>
                        <Typography>
                            {t('plugin_gas_now_dialog_gas_fee', {
                                fee: formatBalance(gasPrice.times(gas), 9, 5),
                                symbol: chainDetailed?.nativeCurrency.symbol,
                            })}
                            {usdRate
                                ? t('plugin_gas_fee_as_usd', {
                                      usd: formatBalance(gasPrice.times(gas).times(usdRate), 9, 2),
                                  })
                                : ''}
                        </Typography>
                        <Image
                            src={theme.palette.mode === 'dark' ? TUNE_ICON_DARK_MODE : TUNE_ICON_LIGHT_MODE}
                            width={20}
                            height={20}
                        />
                    </div>
                </Paper>
            </Grid>
        </>
    ) : null
}
