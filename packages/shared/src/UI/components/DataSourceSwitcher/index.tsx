import { makeStyles, useStylesExtends } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { SourceType, resolveSourceTypeName } from '@masknet/web3-shared-base'
import { Box } from '@mui/system'
import { useSharedI18N } from '@masknet/shared'
import { FootnoteMenuUI, FootnoteMenuOption } from '../FootnoteMenuUI'
import { SourceProviderIcon } from '../SourceProviderIcon'

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

export interface TradeDataSourceProps extends withClasses<'source' | 'sourceNote'> {
    showDataProviderIcon?: boolean
    dataProvider?: SourceType
    dataProviders?: SourceType[]
    onDataProviderChange?: (option: FootnoteMenuOption) => void
}

export const DataSourceSwitcher = function (props: TradeDataSourceProps) {
    const { showDataProviderIcon = false, dataProvider, dataProviders = [], onDataProviderChange } = props
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
                                    <SourceProviderIcon provider={x} size={20} />
                                    <Typography className={classes.sourceName}>{resolveSourceTypeName(x)}</Typography>
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
