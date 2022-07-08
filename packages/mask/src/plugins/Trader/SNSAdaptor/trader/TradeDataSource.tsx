import type { DataProvider } from '@masknet/public-api'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { Box, useTheme } from '@mui/system'
import type { FC } from 'react'
import { useI18N } from '../../../../utils'
import { resolveDataProviderName } from '../../pipes'
import { DataProviderIconUI } from './components/DataProviderIconUI'
import { FootnoteMenuUI, FootnoteMenuOption } from './components/FootnoteMenuUI'

const useStyles = makeStyles()((theme) => {
    return {
        source: {
            justifyContent: 'space-between',
        },
        sourceNote: {
            color: theme.palette.maskColor.secondaryDark,
            fontSize: 14,
            fontWeight: 700,
        },
        sourceMenu: {
            fontSize: 14,
            fontWeight: 'bolder',
        },
        sourceName: {
            fontSize: 14,
            fontWeight: 700,
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
    const theme = useTheme()
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
                    <FootnoteMenuUI
                        options={dataProviders.map((x) => ({
                            name: (
                                <Stack display="inline-flex" flexDirection="row" alignItems="center" gap={0.5}>
                                    <DataProviderIconUI provider={x} size={20} />
                                    <Typography className={classes.sourceName}>{resolveDataProviderName(x)}</Typography>
                                </Stack>
                            ),
                            value: x,
                        }))}
                        selectedIndex={typeof dataProvider !== 'undefined' ? dataProviders.indexOf(dataProvider) : -1}
                        onChange={onDataProviderChange}
                    />
                </Stack>
            ) : null}
        </Box>
    )
}
