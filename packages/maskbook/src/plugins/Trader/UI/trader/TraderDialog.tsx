import { useCallback } from 'react'
import { CardActions, createStyles, DialogContent, Link, makeStyles, Typography } from '@material-ui/core'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { findIndex } from 'lodash-es'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '../../../../utils/hooks/useRemoteControlledDialog'
import { resolveTradeProviderName } from '../../pipes'
import { FootnoteMenu, FootnoteMenuOption } from '../trader/FootnoteMenu'
import { useCurrentTradeProvider } from '../../trending/useCurrentTradeProvider'
import { MaskbookTextIcon } from '../../../../resources/MaskbookIcon'
import { TradeProviderIcon } from '../trader/TradeProviderIcon'
import { currentTradeProviderSettings } from '../../settings'
import { getEnumAsArray } from '../../../../utils/enum'
import { TradeProvider } from '../../types'
import { PluginTraderMessages } from '../../messages'
import { Trader } from './Trader'

const useStyles = makeStyles((theme) => {
    return createStyles({
        footer: {
            justifyContent: 'space-between',
        },
        footnote: {
            color: theme.palette.text.secondary,
            fontSize: 10,
            marginRight: theme.spacing(0.5),
        },
        footLink: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        footMenu: {
            color: theme.palette.text.secondary,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
        },
        footName: {
            marginLeft: theme.spacing(0.5),
        },
        maskbook: {
            width: 40,
            height: 10,
        },
    })
})

const tradeProviders = [
    TradeProvider.UNISWAP,
    TradeProvider.SUSHISWAP,
    TradeProvider.ZRX,
    TradeProvider.SASHIMISWAP,
    TradeProvider.BALANCER,
]
export function TraderDialog() {
    const classes = useStyles()
    const [open, setOpen] = useRemoteControlledDialog(PluginTraderMessages.events.SwapDialogUpdated)
    const onClose = useCallback(() => {
        setOpen({
            open: false,
        })
    }, [])
    const tradeProviderOptions = getEnumAsArray(TradeProvider)
    const onTradeProviderChange = useCallback((option: FootnoteMenuOption) => {
        currentTradeProviderSettings.value = option.value as TradeProvider
    }, [])
    const tradeProvider = useCurrentTradeProvider(tradeProviders)
    return (
        <InjectedDialog open={open} onClose={onClose} title="Swap">
            <DialogContent>
                <Trader />

                <CardActions className={classes.footer}>
                    <Typography className={classes.footnote} variant="subtitle2">
                        <span>Powered by </span>
                        <Link
                            className={classes.footLink}
                            color="textSecondary"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Mask"
                            href="https://mask.io">
                            <MaskbookTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                        </Link>
                    </Typography>

                    <div className={classes.footMenu}>
                        <Typography className={classes.footnote}>Supported by</Typography>
                        <FootnoteMenu
                            options={tradeProviderOptions.map((x) => ({
                                name: (
                                    <>
                                        <TradeProviderIcon provider={x.value} />
                                        <span className={classes.footName}>{resolveTradeProviderName(x.value)}</span>
                                    </>
                                ),
                                value: x.value,
                            }))}
                            selectedIndex={findIndex(getEnumAsArray(TradeProvider), (x) => x.value === tradeProvider)}
                            onChange={onTradeProviderChange}>
                            <ArrowDropDownIcon />
                        </FootnoteMenu>
                    </div>
                </CardActions>
            </DialogContent>
        </InjectedDialog>
    )
}
