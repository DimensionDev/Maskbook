import { makeStyles } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { SourceType, resolveSourceTypeName } from '@masknet/web3-shared-base'
import { Box } from '@mui/system'
import { useSharedI18N } from '@masknet/shared'
import { FootnoteMenu, FootnoteMenuOption } from '../FootnoteMenu/index.js'
import { SourceProviderIcon } from '../SourceProviderIcon/index.js'

const useStyles = makeStyles<{
    isNFTProjectPopper?: boolean
    isWeb3Profile?: boolean
}>()((theme, { isWeb3Profile, isNFTProjectPopper }) => {
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
            flexDirection: isWeb3Profile ? 'row-reverse' : 'row',
        },
    }
})

export interface SourceSwitcherProps extends withClasses<'source' | 'sourceNote'> {
    sourceType?: SourceType
    sourceTypes?: SourceType[]
    isSingleDataProvider?: boolean
    isNFTProjectPopper?: boolean
    isProfilePage?: boolean
    onSourceTypeChange?: (option: FootnoteMenuOption) => void
}

export function SourceSwitcher(props: SourceSwitcherProps) {
    const {
        sourceType,
        sourceTypes = [],
        onSourceTypeChange,
        isSingleDataProvider = false,
        isNFTProjectPopper = false,
        isProfilePage = false,
    } = props
    const t = useSharedI18N()
    const isWeb3Profile = isNFTProjectPopper || isProfilePage
    const { classes } = useStyles({ isNFTProjectPopper, isWeb3Profile }, { props })

    return (
        <Box className={classes.source}>
            <Stack
                className={classes.sourceMenu}
                display="inline-flex"
                flexDirection="row"
                alignItems="center"
                gap={0.5}>
                <Typography className={classes.sourceNote}>
                    {isWeb3Profile || isSingleDataProvider ? t.powered_by() : t.plugin_trader_data_source()}
                </Typography>
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
                    isSingleDataProvider={isSingleDataProvider || isWeb3Profile}
                    selectedIndex={typeof sourceType !== 'undefined' ? sourceTypes.indexOf(sourceType) : -1}
                    onChange={onSourceTypeChange}
                />
            </Stack>
        </Box>
    )
}
