import { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { Icons } from '@masknet/icons'
import type { PluginID } from '@masknet/shared-base'
import { useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { makeStyles, LoadingBase, useStylesExtends } from '@masknet/theme'
import { Button, Typography } from '@mui/material'
import Services from '../../extension/service.js'
import { useI18N } from '../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'inline-flex',
        gap: theme.spacing(1),
        borderRadius: 20,
        minWidth: 254,
        height: 40,
    },
}))

interface PluginEnableBoundaryProps extends withClasses<'root'> {
    pluginId: PluginID
    children: React.ReactNode
}
export const PluginEnableBoundary = memo<PluginEnableBoundaryProps>((props) => {
    const { t } = useI18N()
    const { children, pluginId } = props
    const classes = useStylesExtends(useStyles(), props)

    const disabled = useIsMinimalMode(pluginId)

    const [{ loading }, onEnablePlugin] = useAsyncFn(async () => {
        await Services.Settings.setPluginMinimalModeEnabled(pluginId, false)
    }, [pluginId])

    if (disabled) {
        return (
            <Button className={classes.root} color="primary" onClick={onEnablePlugin}>
                {loading && <LoadingBase size={18} />}
                {!loading && <Icons.Plugin size={18} />}
                <Typography fontSize={14} fontWeight={700}>
                    {t('enable_plugin_boundary')}
                </Typography>
            </Button>
        )
    }
    return <>{children}</>
})
