import { Icons } from '@masknet/icons'
import { PluginId, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { makeStyles, LoadingBase } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import { memo } from 'react'
import Services from '../../extension/service'
import { useI18N } from '../../utils'
import { useAsyncFn } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    button: {
        borderRadius: '99px',
        backgroundColor: theme.palette.maskColor.dark,
        color: theme.palette.maskColor.white,
        marginTop: 'auto',
        ':hover': {
            color: theme.palette.maskColor.white,
            backgroundColor: theme.palette.maskColor.dark,
        },
    },
}))

interface PluginEnableBoundaryProps extends React.PropsWithChildren<{}> {
    pluginId: PluginId
}
export const PluginEnableBoundary = memo<PluginEnableBoundaryProps>(({ children, pluginId }) => {
    const { t } = useI18N()
    const { classes } = useStyles()

    const disabled = useIsMinimalMode(pluginId)

    const [{ loading }, onEnablePlugin] = useAsyncFn(async () => {
        await Services.Settings.setPluginMinimalModeEnabled(pluginId, false)
    }, [pluginId])

    if (disabled) {
        return (
            <Button className={classes.button} variant="contained" onClick={onEnablePlugin}>
                {loading && <LoadingBase size={24} />}
                {!loading && <Icons.Plugin />}
                <Typography marginLeft="9px">{t('enable_plugin_boundary')}</Typography>
            </Button>
        )
    }
    return <>{children}</>
})
