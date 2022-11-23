import { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { Icons } from '@masknet/icons'
import type { PluginID } from '@masknet/shared-base'
import { useActivatedPluginsSNSAdaptor, useIsMinimalMode } from '@masknet/plugin-infra/content-script'
import { makeStyles, ActionButton } from '@masknet/theme'
import { Typography } from '@mui/material'
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
    pluginID: PluginID
    children: React.ReactNode
}
export const PluginEnableBoundary = memo<PluginEnableBoundaryProps>((props) => {
    const { t } = useI18N()
    const { children, pluginID } = props
    const { classes } = useStyles(undefined, { props })

    const disabled = useIsMinimalMode(pluginID)
    const plugins = useActivatedPluginsSNSAdaptor(true)

    const [{ loading }, onEnablePlugin] = useAsyncFn(async () => {
        await Services.Settings.setPluginMinimalModeEnabled(pluginID, false)
    }, [pluginID])

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
