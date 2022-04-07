import { useState, useCallback, useEffect } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Alert, DialogContent, Typography } from '@mui/material'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useI18N } from '../../../../utils'
import { SlippageSlider } from './SlippageSlider'
import { currentSlippageSettings } from '../../settings'
import { PluginTraderMessages } from '../../messages'
import { ExpandMore } from '@mui/icons-material'
import { Gas1559Settings } from './Gas1559Settings'
import { GasPrior1559Settings } from './GasPrior1559Settings'
import { GasOptionConfig, isEIP1559Supported, useChainId } from '@masknet/web3-shared-evm'
import { InfoIcon } from '@masknet/icons'

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
        alert: {
            backgroundColor: MaskColorVar.twitterInfoBackground.alpha(0.1),
            color: MaskColorVar.redMain,
            marginTop: 12,
            fontSize: 12,
            lineHeight: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
        },
        warningIcon: {
            color: MaskColorVar.redMain,
        },
    }
})

const WARNING_SLIPPAGE = 1000

export interface SettingsDialogProps extends withClasses<'root'> {}

export function SettingsDialog(props: SettingsDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const slippage = useValueRef(currentSlippageSettings)
    const chainId = useChainId()

    const [gasConfig, setGasConfig] = useState<GasOptionConfig>()
    const [unconfirmedSlippage, setUnconfirmedSlippage] = useState(slippage)
    const [warningVisible, setWarningVisible] = useState(unconfirmedSlippage >= WARNING_SLIPPAGE)

    // #region remote controlled dialog
    const { open, setDialog, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated)
    // #endregion

    useEffect(() => {
        setUnconfirmedSlippage(slippage)
    }, [slippage])

    useEffect(() => {
        setWarningVisible(unconfirmedSlippage >= WARNING_SLIPPAGE)
    }, [unconfirmedSlippage])

    const onSaveSlippage = useCallback(() => {
        currentSlippageSettings.value = unconfirmedSlippage
    }, [unconfirmedSlippage])

    const onSubmit = useCallback(
        (gasConfig?: GasOptionConfig) => {
            setGasConfig(gasConfig)
            setDialog({
                open: false,
                gasConfig,
            })
        },
        [closeDialog],
    )

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_trader_slippage_tolerance')}>
            <DialogContent>
                <Accordion className={classes.accordion} elevation={0} defaultExpanded>
                    <AccordionSummary className={classes.summary} expandIcon={<ExpandMore />}>
                        <Typography className={classes.heading}>{t('plugin_trader_max_slippage')}</Typography>
                        <Typography>{unconfirmedSlippage / 100}%</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={classes.slippage}>
                        <SlippageSlider value={unconfirmedSlippage} onChange={setUnconfirmedSlippage} />
                    </AccordionDetails>
                    {warningVisible ? (
                        <Alert
                            className={classes.alert}
                            severity="info"
                            icon={<InfoIcon className={classes.warningIcon} />}>
                            {t('plugin_trader_slippage_warning')}
                        </Alert>
                    ) : null}
                </Accordion>
                {isEIP1559Supported(chainId) ? (
                    <Gas1559Settings
                        onCancel={closeDialog}
                        onSave={onSubmit}
                        gasConfig={gasConfig}
                        onSaveSlippage={onSaveSlippage}
                    />
                ) : (
                    <GasPrior1559Settings
                        onCancel={closeDialog}
                        onSave={onSubmit}
                        gasConfig={gasConfig}
                        onSaveSlippage={onSaveSlippage}
                    />
                )}
            </DialogContent>
        </InjectedDialog>
    )
}
