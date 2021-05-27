import type { FC } from 'react'
import { CardActions, Link, makeStyles, Typography } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import { MaskbookTextIcon } from '../../../../resources/MaskbookIcon'
import { getEnumAsArray } from '../../../../utils/enum'
import { DataProvider, TradeProvider } from '../../types'
import { resolveDataProviderName, resolveTradeProviderName } from '../../pipes'
import { findIndex } from 'lodash-es'
import { DataProviderIcon } from '../trader/DataProviderIcon'
import { TradeProviderIcon } from '../trader/TradeProviderIcon'
import { FootnoteMenu, FootnoteMenuOption } from '../trader/FootnoteMenu'
import { useI18N } from '../../../../utils'

const useStyles = makeStyles((theme) => {
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
    const dataProviderOptions = showDataProviderIcon
        ? getEnumAsArray(DataProvider).filter((x) => dataProviders.includes(x.value))
        : []
    const tradeProviderOptions = showTradeProviderIcon
        ? getEnumAsArray(TradeProvider).filter((x) => tradeProviders.includes(x.value))
        : []
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
                        options={dataProviderOptions.map((x) => ({
                            name: (
                                <>
                                    <DataProviderIcon provider={x.value} />
                                    <span className={classes.footName}>{resolveDataProviderName(x.value)}</span>
                                </>
                            ),
                            value: x.value,
                        }))}
                        selectedIndex={findIndex(dataProviderOptions, (x) => x.value === dataProvider)}
                        onChange={onDataProviderChange}
                    />
                    <ArrowDropDownIcon />
                </div>
            ) : null}
            {showTradeProviderIcon ? (
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
            ) : null}
        </CardActions>
    )
}
