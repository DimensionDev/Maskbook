import { useCallback } from 'react'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Card,
    CardActions,
    CardContent,
    DialogContent,
    makeStyles,
    Paper,
    Switch,
    Typography,
} from '@material-ui/core'
import { useValueRef, useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { getEnumAsArray } from '@dimensiondev/kit'
import { useI18N } from '../../../../utils'
import { TradeProvider, ZrxTradePool } from '../../types'
import { SelectPoolPanel } from './SelectPoolPanel'
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
import stringify from 'json-stable-stringify'
import { useTradeProviderSettings } from '../../trader/useTradeSettings'

const useStyles = makeStyles((theme) => {
    return {
        content: {},
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2),
        },
        heading: {
            flex: 1,
        },
        subheading: {},
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
    const SHO = useValueRef(currentSingleHopOnlySettings)
    const { pools } = useTradeProviderSettings(provider)

    //#region remote controlled dialog
    const { open, closeDialog } = useRemoteControlledDialog(PluginTraderMessages.swapSettingsUpdated)
    //#endregion

    const onReset = useCallback(() => {
        currentTradeProviderSettings.value = TradeProvider.UNISWAP_V2
        currentSlippageSettings.value = SLIPPAGE_DEFAULT
        if (provider === TradeProvider.ZRX)
            getCurrentTradeProviderGeneralSettings(provider).value = stringify({
                pools: getEnumAsArray(ZrxTradePool).map((x) => x.value),
            })
    }, [provider])

    return (
        <InjectedDialog open={open} onClose={closeDialog} title={t('plugin_trader_swap_settings')} maxWidth="xs">
            <DialogContent className={classes.content}>
                <Paper component="section" elevation={0}>
                    <Card elevation={0}>
                        <CardContent>
                            <Accordion className={classes.accordion} elevation={0}>
                                <AccordionSummary>
                                    <Typography className={classes.heading}>
                                        {t('plugin_trader_slipage_tolerance')}
                                    </Typography>
                                    <Typography className={classes.subheading}>{slippage / 100}%</Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classes.details}>
                                    <SlippageSlider
                                        value={slippage}
                                        onChange={(tolerance) => {
                                            currentSlippageSettings.value = tolerance
                                        }}
                                    />
                                </AccordionDetails>
                            </Accordion>
                            {
                                provider === TradeProvider.UNISWAP_V3 ? (
                                    <Accordion className={classes.accordion} elevation={0} expanded={false}>
                                        <AccordionSummary>
                                            <Typography className={classes.heading}>
                                                {t('plugin_trader_single_hop_only')}
                                            </Typography>
                                            <Switch
                                                color="primary"
                                                size="small"
                                                checked={SHO}
                                                onChange={(ev) => {
                                                    ev.stopPropagation()
                                                    currentSingleHopOnlySettings.value = ev.target.checked
                                                }}
                                            />
                                        </AccordionSummary>
                                    </Accordion>
                                ) : null
                            }
                            {provider === TradeProvider.ZRX ? (
                                <Accordion className={classes.accordion} elevation={0}>
                                    <AccordionSummary>
                                        <Typography className={classes.heading}>Exchanges</Typography>
                                        <Typography className={classes.subheading}>{pools.length}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails className={classes.details}>
                                        <SelectPoolPanel
                                            value={pools}
                                            onChange={(pools) => {
                                                getCurrentTradeProviderGeneralSettings(provider).value = stringify({
                                                    pools,
                                                })
                                            }}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            ) : null}
                        </CardContent>
                        <CardActions className={classes.footer}>
                            <Button variant="text" onClick={closeDialog}>
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
