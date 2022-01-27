import type { DataProvider } from '@masknet/public-api'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { CardActions, Link, Typography } from '@mui/material'
import type { FC } from 'react'
import { MaskTextIcon } from '../../../../resources/MaskIcon'
import { useI18N } from '../../../../utils'
import { resolveDataProviderName } from '../../pipes'
import { DataProviderIcon } from './DataProviderIcon'
import { FootnoteMenu, FootnoteMenuOption } from './FootnoteMenu'

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
        mask: {
            width: 40,
            height: 10,
        },
    }
})

export interface TradeFooterProps extends withClasses<'footer'> {
    showDataProviderIcon?: boolean
    dataProvider?: DataProvider
    dataProviders?: DataProvider[]
    onDataProviderChange?: (option: FootnoteMenuOption) => void
}

export const TradeFooter: FC<TradeFooterProps> = (props) => {
    const { showDataProviderIcon = false, dataProvider, dataProviders = [], onDataProviderChange } = props
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
                    <MaskTextIcon classes={{ root: classes.mask }} viewBox="0 0 80 20" />
                </Link>
            </Typography>
            {showDataProviderIcon ? (
                <div className={classes.footMenu}>
                    <Typography className={classes.footnote}>{t('plugin_trader_data_source')}</Typography>
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
        </CardActions>
    )
}
