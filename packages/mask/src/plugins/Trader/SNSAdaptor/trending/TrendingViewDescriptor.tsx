import { Box } from '@mui/system'
import { resolveSourceTypeName } from '@masknet/web3-shared-base'
import { DataProviderIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { Stack, Typography } from '@mui/material'
import { useI18N } from '../../../../utils/index.js'
import { PluginDescriptor } from './PluginDescriptor.js'

const useStyles = makeStyles<{
    isPopper: boolean
    isNFTProjectPopper: boolean
}>()((theme, props) => {
    return {
        source: {
            display: 'flex',
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
            color:
                props.isPopper || props.isNFTProjectPopper
                    ? theme.palette.maskColor.main
                    : theme.palette.maskColor.dark,
            marginLeft: 4,
        },
    }
})

export interface TrendingViewDescriptorProps {
    trending: TrendingAPI.Trending
    isProfilePage?: boolean
    isNFTProjectPopper?: boolean
    isPopper?: boolean
}

export function TrendingViewDescriptor(props: TrendingViewDescriptorProps) {
    const { trending, isProfilePage, isNFTProjectPopper = false, isPopper = true } = props

    const { t } = useI18N()

    const { classes } = useStyles({ isPopper, isNFTProjectPopper })

    return (
        <PluginDescriptor isNFTProjectPopper={isNFTProjectPopper} isProfilePage={isProfilePage} isPopper={isPopper}>
            <Box className={classes.source}>
                <Stack
                    className={classes.sourceMenu}
                    display="inline-flex"
                    flexDirection="row"
                    alignItems="center"
                    gap={0.5}>
                    <Typography className={classes.sourceNote}>{t('powered_by')}</Typography>
                </Stack>
                {trending.dataProvider ? (
                    <Stack display="inline-flex" flexDirection="row" alignItems="center" gap={0.5}>
                        <Typography className={classes.sourceName}>
                            {resolveSourceTypeName(trending.dataProvider)}
                        </Typography>
                        <DataProviderIcon provider={trending.dataProvider} size={20} />
                    </Stack>
                ) : null}
            </Box>
        </PluginDescriptor>
    )
}
