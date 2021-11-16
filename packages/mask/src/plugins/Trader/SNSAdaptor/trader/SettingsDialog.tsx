import { useState, useCallback, useEffect } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, DialogContent, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useValueRef, useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { useI18N } from '../../../../utils'
import { SlippageSlider } from './SlippageSlider'
import { currentSlippageSettings } from '../../settings'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { PluginTraderMessages } from '../../messages'
import { ExpandMore } from '@mui/icons-material'
import { Gas1559Settings } from './Gas1559Settings'
import { currentNetworkSettings } from '../../../Wallet/settings'
import { GasPrior1559Settings } from './GasPrior1559Settings'
import { NetworkType } from '@masknet/web3-shared-evm'

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
    const networkType = useValueRef(currentNetworkSettings)

    const [unconfirmedSlippage, setUnconfirmedSlippage] = useState(slippage)

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated)
    //#endregion

    useEffect(() => {
        setUnconfirmedSlippage(slippage)
    }, [slippage])

    const onSubmit = useCallback(() => {
        currentSlippageSettings.value = unconfirmedSlippage
        closeDialog()
    }, [unconfirmedSlippage, closeDialog])

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
                <Accordion className={classes.accordion} elevation={0}>
                    <AccordionSummary className={classes.summary} expandIcon={<ExpandMore />}>
                        <Typography className={classes.heading}>{t('popups_wallet_gas_price')}</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{ paddingLeft: 0, paddingRight: 0 }}>
                        {networkType === NetworkType.Ethereum ? <Gas1559Settings /> : <GasPrior1559Settings />}
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
        </InjectedDialog>
    )
}
