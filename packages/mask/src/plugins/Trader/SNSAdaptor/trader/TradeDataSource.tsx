import type { DataProvider } from '@masknet/public-api'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import type { FC } from 'react'
import { useI18N } from '../../../../utils'
import { resolveDataProviderName } from '../../pipes'
import { DataProviderIcon } from './DataProviderIcon'
import { FootnoteMenu, FootnoteMenuOption } from './FootnoteMenu'

const useStyles = makeStyles()((theme) => {
    return {
        source: {
            justifyContent: 'space-between',
        },
        sourceNote: {
            color: theme.palette.text.secondary,
            fontSize: 14,
            fontWeight: 'bolder',
        },
        sourceMenu: {
            color: theme.palette.text.secondary,
            fontSize: 14,
            fontWeight: 'bolder',
        },
        sourceName: {
            fontSize: 14,
            fontWeight: 'bolder',
        },
    }
})

export interface TradeDataSourceProps extends withClasses<'source'> {
    showDataProviderIcon?: boolean
    dataProvider?: DataProvider
    dataProviders?: DataProvider[]
    onDataProviderChange?: (option: FootnoteMenuOption) => void
}

export const TradeDataSource: FC<TradeDataSourceProps> = (props) => {
    const { showDataProviderIcon = false, dataProvider, dataProviders = [], onDataProviderChange } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    return (
        <Box className={classes.source}>
            {showDataProviderIcon ? (
                <Stack
                    className={classes.sourceMenu}
                    display="inline-flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={0.5}>
                    <Typography className={classes.sourceNote}>{t('plugin_trader_data_source')}</Typography>
                    <FootnoteMenu
                        options={dataProviders.map((x) => ({
                            name: (
                                <Stack display="inline-flex" flexDirection="row" alignItems="center" gap={0.5}>
                                    <DataProviderIcon provider={x} size={20} />
                                    <Typography className={classes.sourceName}>{resolveDataProviderName(x)}</Typography>
                                </Stack>
                            ),
                            value: x,
                        }))}
                        selectedIndex={typeof dataProvider !== 'undefined' ? dataProviders.indexOf(dataProvider) : -1}
                        onChange={onDataProviderChange}
                    />
                    <ArrowDropDownIcon />
                </Stack>
            ) : null}
        </Box>
    )
}
