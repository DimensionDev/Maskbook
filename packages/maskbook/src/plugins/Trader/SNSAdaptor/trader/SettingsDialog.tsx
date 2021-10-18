import { useState, useCallback, useEffect } from 'react'
import stringify from 'json-stable-stringify'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Card,
    CardActions,
    CardContent,
    DialogContent,
    Paper,
    Switch,
    Typography,
} from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useValueRef, useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { TradeProvider } from '@masknet/public-api'
import { getEnumAsArray } from '@dimensiondev/kit'
import { useI18N } from '../../../../utils'
import { ZrxTradePool } from '../../types'
import { SlippageSlider } from './SlippageSlider'
import {
    currentSingleHopOnlySettings,
    currentSlippageSettings,
    currentTradeProviderSettings,
    getCurrentTradeProviderGeneralSettings,
} from '../../settings'
import { SLIPPAGE_DEFAULT } from '../../constants'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { PluginTraderMessages } from '../../messages'
import { useSingleHopOnly } from '../../trader/uniswap/useSingleHopOnly'

const useStyles = makeStyles()((theme) => {
    return {
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2),
        },
        heading: {
            flex: 1,
        },
        accordion: {
            backgroundColor: theme.palette.background.default,
        },
        details: {
            display: 'flex',
        },
    }
})

export interface SettingsDialogProps extends withClasses<'root'> {}

export function SettingsDialog(props: SettingsDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const provider = useValueRef(currentTradeProviderSettings)
    const slippage = useValueRef(currentSlippageSettings)
    const singleHopOnly = useSingleHopOnly()
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

    const onReset = useCallback(() => {
        currentSlippageSettings.value = SLIPPAGE_DEFAULT
        if (provider === TradeProvider.ZRX)
            getCurrentTradeProviderGeneralSettings(provider).value = stringify({
                pools: getEnumAsArray(ZrxTradePool).map((x) => x.value),
            })
    }, [provider])

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_trader_swap_settings')} maxWidth="xs">
            <DialogContent>
                <Paper component="section" elevation={0}>
                    <Card elevation={0}>
                        <CardContent>
                            <Accordion className={classes.accordion} elevation={0}>
                                <AccordionSummary>
                                    <Typography className={classes.heading}>
                                        {t('plugin_trader_slippage_tolerance')}
                                    </Typography>
                                    <Typography>{unconfirmedSlippage / 100}%</Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classes.details}>
                                    <SlippageSlider value={unconfirmedSlippage} onChange={setUnconfirmedSlippage} />
                                </AccordionDetails>
                            </Accordion>
                            {provider === TradeProvider.UNISWAP_V3 ? (
                                <Accordion className={classes.accordion} elevation={0} expanded={false}>
                                    <AccordionSummary>
                                        <Typography className={classes.heading}>
                                            {t('plugin_trader_single_hop_only')}
                                        </Typography>
                                        <Switch
                                            color="primary"
                                            size="small"
                                            checked={singleHopOnly}
                                            onChange={(ev) => {
                                                ev.stopPropagation()
                                                currentSingleHopOnlySettings.value = ev.target.checked
                                            }}
                                        />
                                    </AccordionSummary>
                                </Accordion>
                            ) : null}
                        </CardContent>
                        <CardActions className={classes.footer}>
                            <Button variant="text" onClick={onSubmit}>
                                {t('confirm')}
                            </Button>
                            <Button variant="text" onClick={onReset}>
                                {t('reset')}
                            </Button>
                        </CardActions>
                    </Card>
                </Paper>
            </DialogContent>
        </InjectedDialog>
    )
}
