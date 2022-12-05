import { makeStyles } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { SourceType, resolveSourceTypeName } from '@masknet/web3-shared-base'
import { Box } from '@mui/system'
import { useSharedI18N } from '@masknet/shared'
import { FootnoteMenu, FootnoteMenuOption } from '../FootnoteMenu/index.js'
import { SourceProviderIcon } from '../SourceProviderIcon/index.js'

const useStyles = makeStyles<{ isSingleDataProvider?: boolean; isNFTProjectPopper?: boolean }>()(
    (theme, { isSingleDataProvider, isNFTProjectPopper }) => {
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
                color: theme.palette.mode === 'dark' && !isNFTProjectPopper ? '' : theme.palette.maskColor.main,
            },
            nameWrapper: {
                flexDirection: isSingleDataProvider ? 'row-reverse' : 'row',
            },
        }
    },
)

export interface SourceSwitcherProps extends withClasses<'source' | 'sourceNote'> {
    sourceType?: SourceType
    sourceTypes?: SourceType[]
    isSingleDataProvider?: boolean
    isNFTProjectPopper?: boolean
    onSourceTypeChange?: (option: FootnoteMenuOption) => void
}

export function SourceSwitcher(props: SourceSwitcherProps) {
    const {
        sourceType,
        sourceTypes = [],
        onSourceTypeChange,
        isSingleDataProvider = false,
        isNFTProjectPopper = false,
    } = props
    const t = useSharedI18N()
    const { classes } = useStyles({ isSingleDataProvider, isNFTProjectPopper }, { props })

    return (
        <Box className={classes.source}>
            <Stack
                className={classes.sourceMenu}
                display="inline-flex"
                flexDirection="row"
                alignItems="center"
                gap={0.5}>
                <Typography className={classes.sourceNote}>{t.powered_by()}</Typography>
                <FootnoteMenu
                    options={sourceTypes.map((x) => ({
                        name: (
                            <Stack
                                display="inline-flex"
                                flexDirection="row"
                                alignItems="center"
                                gap={0.5}
                                className={classes.nameWrapper}>
                                <SourceProviderIcon provider={x} size={20} />
                                <Typography className={classes.sourceName}>{resolveSourceTypeName(x)}</Typography>
                            </Stack>
                        ),
                        value: x,
                    }))}
                    isSingleDataProvider={isSingleDataProvider}
                    selectedIndex={typeof sourceType !== 'undefined' ? sourceTypes.indexOf(sourceType) : -1}
                    onChange={onSourceTypeChange}
                />
            </Stack>
        </Box>
    )
}
