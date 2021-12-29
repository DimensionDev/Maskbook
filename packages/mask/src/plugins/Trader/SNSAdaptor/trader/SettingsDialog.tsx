import { useState, useCallback, useEffect } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, DialogContent, Typography } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { SlippageSlider } from './SlippageSlider'
import { currentSlippageSettings } from '../../settings'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { PluginTraderMessages } from '../../messages'
import { ExpandMore } from '@mui/icons-material'
import { Gas1559Settings } from './Gas1559Settings'
import { GasPrior1559Settings } from './GasPrior1559Settings'
import { GasOptionConfig, NetworkType, useNetworkType } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    return {
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2),
        },
        heading: {
            flex: 1,
            fontWeight: 500,
            fontSize: 16,
            lineHeight: '22px',
        },
        summary: {
            padding: 0,
        },
        accordion: {
            backgroundColor: 'inherit',
        },
        slippage: {
            display: 'flex',
            paddingLeft: 10,
            paddingRight: 10,
        },
    }
})

export interface SettingsDialogProps extends withClasses<'root'> {}

export function SettingsDialog(props: SettingsDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const slippage = useValueRef(currentSlippageSettings)
    const networkType = useNetworkType()

    const [gasConfig, setGasConfig] = useState<GasOptionConfig>()
    const [unconfirmedSlippage, setUnconfirmedSlippage] = useState(slippage)

    //#region remote controlled dialog
    const { open, setDialog, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated)
    //#endregion

    useEffect(() => {
        setUnconfirmedSlippage(slippage)
    }, [slippage])

    const onSubmit = useCallback(
        (gasConfig?: GasOptionConfig) => {
            currentSlippageSettings.value = unconfirmedSlippage
            setGasConfig(gasConfig)
            setDialog({
                open: false,
                gasConfig,
            })
        },
        [unconfirmedSlippage, closeDialog],
    )

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_trader_slippage_tolerance')}>
            <DialogContent>
                <Accordion className={classes.accordion} elevation={0}>
                    <AccordionSummary className={classes.summary} expandIcon={<ExpandMore />}>
                        <Typography className={classes.heading}>{t('plugin_trader_max_slippage')}</Typography>
                        <Typography>{unconfirmedSlippage / 100}%</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.slippage}>
                        <SlippageSlider value={unconfirmedSlippage} onChange={setUnconfirmedSlippage} />
                    </AccordionDetails>
                </Accordion>
                {networkType === NetworkType.Ethereum ? (
                    <Gas1559Settings onCancel={closeDialog} onSave={onSubmit} gasConfig={gasConfig} />
                ) : (
                    <GasPrior1559Settings onCancel={closeDialog} onSave={onSubmit} gasConfig={gasConfig} />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
