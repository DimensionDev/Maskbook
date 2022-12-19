import { Box } from '@mui/system'
import { resolveSourceTypeName } from '@masknet/web3-shared-base'
import { DataProviderIcon } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useContext } from 'react'
import type { TrendingAPI } from '@masknet/web3-providers/types'
import { Stack, Typography } from '@mui/material'
import { useI18N } from '../../../../utils/index.js'
import { TrendingViewContext } from './context.js'
import { PluginDescriptor } from './PluginDescriptor.js'

const useStyles = makeStyles<{
    isTokenTagPopper: boolean
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
                props.isTokenTagPopper || props.isNFTProjectPopper
                    ? theme.palette.maskColor.main
                    : theme.palette.maskColor.dark,
            marginLeft: 4,
        },
    }
})

export interface TrendingViewDescriptorProps {
    trending: TrendingAPI.Trending
}

export function TrendingViewDescriptor(props: TrendingViewDescriptorProps) {
    const { trending } = props
    const { isProfilePage, isNFTProjectPopper = false, isTokenTagPopper = true } = useContext(TrendingViewContext)
    const { t } = useI18N()

    const { classes } = useStyles({ isTokenTagPopper, isNFTProjectPopper })

    return (
        <PluginDescriptor
            isNFTProjectPopper={isNFTProjectPopper}
            isProfilePage={isProfilePage}
            isTokenTagPopper={isTokenTagPopper}>
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
