import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useSharedI18N } from '@masknet/shared'
import { FootnoteMenuUI, FootnoteMenuOption } from '../FootnoteMenuUI/index'

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
            color: theme.palette.mode === 'dark' ? '' : theme.palette.maskColor.publicMain,
        },
    }
})

export interface TradeDataSourceProps<T> extends withClasses<'source' | 'sourceNote'> {
    showDataProviderIcon?: boolean
    dataProvider?: T
    dataProviders?: T[]
    resolveDataProviderName: (key: T) => string
    DataProviderIconUI: (props: { provider: T; size?: number }) => JSX.Element
    onDataProviderChange?: (option: FootnoteMenuOption) => void
}

export const DataSourceSwitcher = function <T extends string | number>(props: TradeDataSourceProps<T>) {
    const {
        showDataProviderIcon = false,
        dataProvider,
        dataProviders = [],
        onDataProviderChange,
        resolveDataProviderName,
        DataProviderIconUI,
    } = props
    const t = useSharedI18N()
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
                    <Typography className={classes.sourceNote}>{t.plugin_trader_data_source()}</Typography>
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
