import type { FC } from 'react'
import { CardActions, Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useStylesExtends } from '@masknet/shared'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { MaskbookTextIcon } from '../../../../resources/MaskbookIcon'
import type { DataProvider, TradeProvider } from '@masknet/public-api'
import { resolveDataProviderName, resolveTradeProviderName } from '../../pipes'
import { DataProviderIcon } from './DataProviderIcon'
import { TradeProviderIcon } from './TradeProviderIcon'
import { FootnoteMenu, FootnoteMenuOption } from './FootnoteMenu'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles()((theme) => {
    return {
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
    }
})

export interface TradeFooterProps extends withClasses<'footer'> {
    showDataProviderIcon?: boolean
    showTradeProviderIcon?: boolean
    dataProvider?: DataProvider
    tradeProvider?: TradeProvider
    dataProviders?: DataProvider[]
    tradeProviders?: TradeProvider[]
    onDataProviderChange?: (option: FootnoteMenuOption) => void
    onTradeProviderChange?: (option: FootnoteMenuOption) => void
}

export const TradeFooter: FC<TradeFooterProps> = (props) => {
    const {
        showDataProviderIcon = false,
        showTradeProviderIcon = false,
        dataProvider,
        tradeProvider,
        dataProviders = [],
        tradeProviders = [],
        onDataProviderChange,
        onTradeProviderChange,
    } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    return (
        <CardActions className={classes.footer}>
            <Typography className={classes.footnote} variant="subtitle2">
                <span>{t('plugin_powered_by')} </span>
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
            {showDataProviderIcon ? (
                <div className={classes.footMenu}>
                    <Typography className={classes.footnote}>Data Source</Typography>
                    <FootnoteMenu
                        options={dataProviders.map((x) => ({
                            name: (
                                <>
                                    <DataProviderIcon provider={x} />
                                    <span className={classes.footName}>{resolveDataProviderName(x)}</span>
                                </>
                            ),
                            value: x,
                        }))}
                        selectedIndex={typeof dataProvider !== 'undefined' ? dataProviders.indexOf(dataProvider) : -1}
                        onChange={onDataProviderChange}
                    />
                    <ArrowDropDownIcon />
                </div>
            ) : null}
            {showTradeProviderIcon ? (
                <div className={classes.footMenu}>
                    <Typography className={classes.footnote}>Supported by</Typography>
                    <FootnoteMenu
                        options={tradeProviders.map((x) => ({
                            name: (
                                <>
                                    <TradeProviderIcon provider={x} />
                                    <span className={classes.footName}>{resolveTradeProviderName(x)}</span>
                                </>
                            ),
                            value: x,
                        }))}
                        selectedIndex={
                            typeof tradeProvider !== 'undefined' ? tradeProviders.indexOf(tradeProvider) : -1
                        }
                        onChange={onTradeProviderChange}>
                        <ArrowDropDownIcon />
                    </FootnoteMenu>
                </div>
            ) : null}
        </CardActions>
    )
}
