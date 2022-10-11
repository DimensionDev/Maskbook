import { Box, Paper, Typography } from '@mui/material'
import { useAvailablePlugins } from '@masknet/plugin-infra'
import { PluginI18NFieldRender, useActivatedPluginsSNSAdaptor, Widget } from '@masknet/plugin-infra/content-script'

export interface WidgetContentProps {
    onClose?: () => void
}

export function WidgetContent(props: WidgetContentProps) {
    const activatedPlugins = useActivatedPluginsSNSAdaptor('any')
    const displayPlugins = useAvailablePlugins(activatedPlugins, (plugins) => {
        return plugins.filter((x) => x.Widgets)
    })

    return (
        <Box>
            {displayPlugins.map((x) => (
                <Box key={x.ID}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        <PluginI18NFieldRender field={x.name} pluginID={x.ID} />
                    </Typography>
                    <Paper variant="outlined" sx={{ padding: 1 }}>
                        {x.Widgets?.map((y) => (
                            <Widget key={y.ID} pluginID={x.ID} name={y.name} />
                        ))}
                    </Paper>
                </Box>
            ))}
        </Box>
    )
}
