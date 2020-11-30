import { useCallback, useEffect, useState } from 'react'
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
import { TradePool, TradeProvider } from '../../types'
import { SelectPoolPanel } from './SelectPoolPanel'
import { SlippageSlider } from './SlippageSlider'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { getEnumAsArray } from '../../../../utils/enum'
import { SelectProviderPanel } from './SelectProviderPanel'
import { resolveTradeProviderName } from '../../pipes'
import { currentSlippageTolerance } from '../../settings'
import { DEFAULT_SLIPPAGE_TOLERANCE } from '../../constants'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { PluginTraderMessages } from '../../messages'

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
    })
})

export interface SettingsDialogProps extends withClasses<'root'> {}

export function SettingsDialog(props: SettingsDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const [provider, setProvider] = useState(TradeProvider.UNISWAP)
    const [slippage, setSlippage] = useState(currentSlippageTolerance.value)
    const [listOfSource, setListOfSource] = useState<TradePool[]>(getEnumAsArray(TradePool).map((x) => x.value))

    //#region remote controlled dialog
    const [open, setOpen] = useRemoteControlledDialog(PluginTraderMessages.events.swapSettingsUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [setOpen])
    //#endregion

    // sync slippage to settings
    useEffect(() => {
        currentSlippageTolerance.value = slippage
    }, [slippage])

    const onReset = useCallback(() => {
        setProvider(TradeProvider.UNISWAP)
        setSlippage(DEFAULT_SLIPPAGE_TOLERANCE)
        setListOfSource(getEnumAsArray(TradePool).map((x) => x.value))
    }, [])

    return (
        <InjectedDialog open={open} onClose={onClose} title="Swap Settings" DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent className={classes.content}>
                <Paper component="section" elevation={0}>
                    <Card elevation={0}>
                        <CardContent>
                            <Accordion className={classes.accordion} elevation={0} expanded>
                                <AccordionSummary>
                                    <Typography className={classes.heading}>Provider</Typography>
                                    <Typography className={classes.subheading}>
                                        {resolveTradeProviderName(provider)}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails style={{ display: 'flex' }}>
                                    <SelectProviderPanel value={provider} onChange={setProvider} />
                                </AccordionDetails>
                            </Accordion>
                            <Accordion className={classes.accordion} elevation={0} expanded>
                                <AccordionSummary>
                                    <Typography className={classes.heading}>Slippage Tolerance</Typography>
                                    <Typography className={classes.subheading}>{slippage / 100}%</Typography>
                                </AccordionSummary>
                                <AccordionDetails style={{ display: 'flex' }}>
                                    <SlippageSlider value={slippage} onChange={setSlippage} />
                                </AccordionDetails>
                            </Accordion>
                            {provider === TradeProvider.ZRX ? (
                                <Accordion className={classes.accordion} elevation={0} expanded>
                                    <AccordionSummary>
                                        <Typography className={classes.heading}>Exchanges</Typography>
                                        <Typography className={classes.subheading}>{listOfSource.length}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails style={{ display: 'flex' }}>
                                        <SelectPoolPanel value={listOfSource} onChange={setListOfSource} />
                                    </AccordionDetails>
                                </Accordion>
                            ) : null}
                        </CardContent>
                        <CardActions className={classes.footer}>
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
