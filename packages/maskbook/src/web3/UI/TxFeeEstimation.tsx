import { Button, makeStyles, ButtonProps } from '@material-ui/core'
import { useI18N, useRemoteControlledDialog } from '../../utils'
import { EthereumMessages } from '../../plugins/Ethereum/messages'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { useValueRef, formatWeiToGwei } from '@dimensiondev/maskbook-shared'
import { GasNow, useGasPrice, useNetworkType, NetworkType } from '@dimensiondev/web3-shared'
import { currentGasNowSettings } from '../../plugins/Wallet/settings'
import { useState, useCallback, useMemo } from 'react'

const useStyles = makeStyles(() => {})

interface TxFeeEstimationProps extends withClasses<'TxFeeEstimation'> {
    ButtonProps?: Partial<ButtonProps>
}

export function TxFeeEstimation(props: TxFeeEstimationProps) {
    const { t } = useI18N()
    const _gasPrice = useGasPrice()
    const networkType = useNetworkType()
    const classes = useStylesExtends(useStyles(), props)
    const gasNow = useValueRef(currentGasNowSettings)
    const [type, setType] = useState<keyof GasNow>('fast')

    const { setDialog: setGasPriceDialog } = useRemoteControlledDialog(
        EthereumMessages.events.gasPriceDialogUpdated,
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

    return networkType === NetworkType.Ethereum ? (
        <Button
            className={classes.TxFeeEstimation}
            color={props.ButtonProps?.color ?? 'primary'}
            variant={props.ButtonProps?.variant ?? 'outlined'}
            onClick={() => setGasPriceDialog({ open: true })}>
            {t('plugin_gas_now_dialog_gas_price')} {t('plugin_gas_now_dialog_gwei', { gasPrice })}
        </Button>
    ) : null
}
