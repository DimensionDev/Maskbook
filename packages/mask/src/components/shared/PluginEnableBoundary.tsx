import { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { Icons } from '@masknet/icons'
import type { PluginID } from '@masknet/shared-base'
import { useActivatedPluginsSNSAdaptor, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { makeStyles, useStylesExtends, ActionButton } from '@masknet/theme'
import { Typography } from '@mui/material'
import Services from '../../extension/service.js'
import { useI18N } from '../../utils/index.js'
import { usePluginHostPermissionCheck } from '../DataSource/usePluginHostPermission.js'

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
    const plugins = useActivatedPluginsSNSAdaptor(true)
    const lackPermission = usePluginHostPermissionCheck(plugins)
    const currentPlugin = plugins.find((x) => x.ID === pluginId)
    const [{ loading }, onEnablePlugin] = useAsyncFn(async () => {
        await Services.Settings.setPluginMinimalModeEnabled(pluginId, false)
    }, [pluginId])

    const [{ loading: grantLoading }, onGrantPermissions] = useAsyncFn(async () => {
        if (!currentPlugin?.enableRequirement.host_permissions) return
        await Services.Helper.requestHostPermission(currentPlugin.enableRequirement.host_permissions)
    }, [currentPlugin])

    if (lackPermission?.has(pluginId))
        return (
            <>
                <Typography fontSize={14} marginBottom={3.25}>
                    {t('authorization_descriptions')} {currentPlugin?.enableRequirement.host_permissions?.join(',')}
                </Typography>
                <ActionButton
                    loading={grantLoading}
                    className={classes.root}
                    color="primary"
                    onClick={onGrantPermissions}
                    startIcon={<Icons.KeySquare size={18} />}>
                    {t('authorization')}
                </ActionButton>
            </>
        )

    if (disabled) {
        return (
            <ActionButton
                loading={loading}
                startIcon={<Icons.Plugin size={18} />}
                className={classes.root}
                color="primary"
                onClick={onEnablePlugin}
                sx={{ mt: 10 }}>
                <Typography fontSize={14} fontWeight={700}>
                    {t('enable_plugin_boundary')}
                </Typography>
            </ActionButton>
        )
    }
    return <>{children}</>
})
