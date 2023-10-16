import { Box, Paper, Typography } from '@mui/material'
import { getAvailablePlugins } from '@masknet/plugin-infra'
import { PluginTransFieldRender, useActivatedPluginsSiteAdaptor, Widget } from '@masknet/plugin-infra/content-script'

interface WidgetContentProps {
    onClose?: () => void
}

export function WidgetContent(props: WidgetContentProps) {
    const activatedPlugins = useActivatedPluginsSiteAdaptor('any')
    const displayPlugins = getAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins.filter((x) => x.Widgets)
    })

    return (
        <Box>
            {displayPlugins.map((x) => (
                <Box key={x.ID}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        <PluginTransFieldRender field={x.name} pluginID={x.ID} />
                    </Typography>
                    <Paper variant="outlined" sx={{ padding: 1 }}>
                        {x.Widgets?.map((y) => <Widget key={y.ID} pluginID={x.ID} name={y.name} />)}
                    </Paper>
                </Box>
            ))}
        </Box>
    )
}
