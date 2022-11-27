import { makeStyles } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { SourceType, resolveSourceTypeName } from '@masknet/web3-shared-base'
import { Box } from '@mui/system'
import { useSharedI18N } from '@masknet/shared'
import { FootnoteMenu, FootnoteMenuOption } from '../FootnoteMenu/index.js'
import { SourceProviderIcon } from '../SourceProviderIcon/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        source: {
            justifyContent: 'space-between',
        },
        sourceNote: {
            color: theme.palette.maskColor.secondaryDark,
            fontWeight: 700,
        },
        sourceMenu: {
            fontSize: 14,
            fontWeight: 700,
        },
        sourceName: {
            fontWeight: 700,
            color: theme.palette.mode === 'dark' ? '' : theme.palette.maskColor.publicMain,
        },
    }
})

export interface SourceSwitcherProps extends withClasses<'source' | 'sourceNote'> {
    sourceType?: SourceType
    sourceTypes?: SourceType[]
    hideArrowDropDownIcon?: boolean
    onSourceTypeChange?: (option: FootnoteMenuOption) => void
}

export function SourceSwitcher(props: SourceSwitcherProps) {
    const { sourceType, sourceTypes = [], onSourceTypeChange, hideArrowDropDownIcon = false } = props
    const t = useSharedI18N()
    const { classes } = useStyles(undefined, { props })

    return (
        <Box className={classes.source}>
            <Stack
                className={classes.sourceMenu}
                display="inline-flex"
                flexDirection="row"
                alignItems="center"
                gap={0.5}>
                <Typography className={classes.sourceNote}>
                    {hideArrowDropDownIcon ? t.powered_by() : t.plugin_trader_data_source()}
                </Typography>
                <FootnoteMenu
                    options={sourceTypes.map((x) => ({
                        name: (
                            <Stack display="inline-flex" flexDirection="row" alignItems="center" gap={0.5}>
                                <SourceProviderIcon provider={x} size={20} />
                                <Typography className={classes.sourceName}>{resolveSourceTypeName(x)}</Typography>
                            </Stack>
                        ),
                        value: x,
                    }))}
                    hideArrowDropDownIcon={hideArrowDropDownIcon}
                    selectedIndex={typeof sourceType !== 'undefined' ? sourceTypes.indexOf(sourceType) : -1}
                    onChange={onSourceTypeChange}
                />
            </Stack>
        </Box>
    )
}
