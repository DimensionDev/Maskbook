import { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { Icons } from '@masknet/icons'
import type { PluginID } from '@masknet/shared-base'
import { useIsMinimalMode, useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'
import { makeStyles, ActionButton } from '@masknet/theme'
import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        borderRadius: 20,
        width: 254,
        height: 40,
    },
}))

interface PluginEnableBoundaryProps extends withClasses<'root'> {
    pluginID: PluginID
    children: React.ReactNode
}

export const PluginEnableBoundary = memo<PluginEnableBoundaryProps>((props) => {
    const t = useSharedI18N()
    const { children, pluginID } = props
    const { classes } = useStyles(undefined, { props })
    const { setPluginMinimalModeEnabled } = useSiteAdaptorContext()
    const disabled = useIsMinimalMode(pluginID)

    const [{ loading }, onEnablePlugin] = useAsyncFn(async () => {
        await setPluginMinimalModeEnabled?.(pluginID, false)
    }, [pluginID, setPluginMinimalModeEnabled])

    if (disabled) {
        return (
            <Stack alignItems="center">
                <Stack justifyContent="center" alignItems="center" width="100%" boxSizing="border-box">
                    <Typography fontWeight={400} fontSize={14}>
                        {t.enable_plugin_boundary_description()}
                    </Typography>
                </Stack>
                <ActionButton
                    loading={loading}
                    startIcon={<Icons.Plugin size={18} />}
                    className={classes.root}
                    color="primary"
                    onClick={onEnablePlugin}
                    sx={{ mt: 6 }}>
                    {t.enable_plugin_boundary()}
                </ActionButton>
            </Stack>
        )
    }
    return <>{children}</>
})
