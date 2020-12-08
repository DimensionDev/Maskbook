import { useCallback } from 'react'
import {
    makeStyles,
    createStyles,
    Accordion,
    AccordionSummary,
    Typography,
    AccordionDetails,
    Paper,
    Card,
    CardContent,
    CardActions,
    Button,
    DialogContent,
} from '@material-ui/core'
import { ZrxTradePool, TradeProvider } from '../../types'
import { SelectPoolPanel } from './SelectPoolPanel'
import { SlippageSlider } from './SlippageSlider'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { getEnumAsArray } from '../../../../utils/enum'
import {
    currentSlippageTolerance,
    currentTradeProviderSettings,
    getCurrentTradeProviderGeneralSettings,
} from '../../settings'
import { SLIPPAGE_TOLERANCE_DEFAULT } from '../../constants'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { PluginTraderMessages } from '../../messages'
import { useValueRef } from '../../../../utils/hooks/useValueRef'
import stringify from 'json-stable-stringify'
import { useTradeProviderSettings } from '../../trader/useTradeSettings'

const useStyles = makeStyles((theme) => {
    return createStyles({
        root: {
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper,
            paddingBottom: theme.spacing(2),
            position: 'absolute',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        content: {},
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: theme.spacing(0, 2),
        },
        close: {
            top: 0,
            right: 0,
            position: 'absolute',
        },
        caption: {
            padding: theme.spacing(2, 1),
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
    })
})

export interface SettingsDialogProps extends withClasses<'root'> {}

export function SettingsDialog(props: SettingsDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const provider = useValueRef(currentTradeProviderSettings)
    const slippage = useValueRef(currentSlippageTolerance)
    const { pools } = useTradeProviderSettings(provider)

    //#region remote controlled dialog
    const [open, setOpen] = useRemoteControlledDialog(PluginTraderMessages.events.swapSettingsUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    const onReset = useCallback(() => {
        currentTradeProviderSettings.value = TradeProvider.UNISWAP
        currentSlippageTolerance.value = SLIPPAGE_TOLERANCE_DEFAULT
        if (provider === TradeProvider.ZRX)
            getCurrentTradeProviderGeneralSettings(provider).value = stringify({
                pools: getEnumAsArray(ZrxTradePool).map((x) => x.value),
            })
    }, [provider])

    return (
        <InjectedDialog open={open} onClose={onClose} title="Swap Settings" DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <Paper component="section" elevation={0}>
                    <Card elevation={0}>
                        <CardContent>
                            <Accordion className={classes.accordion} elevation={0}>
                                <AccordionSummary>
                                    <Typography className={classes.heading}>Slippage Tolerance</Typography>
                                    <Typography className={classes.subheading}>{slippage / 100}%</Typography>
                                </AccordionSummary>
                                <AccordionDetails className={classes.details}>
                                    <SlippageSlider
                                        value={slippage}
                                        onChange={(tolerance) => {
                                            currentSlippageTolerance.value = tolerance
                                        }}
                                    />
                                </AccordionDetails>
                            </Accordion>
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
                            <Button variant="text" onClick={onClose}>
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
