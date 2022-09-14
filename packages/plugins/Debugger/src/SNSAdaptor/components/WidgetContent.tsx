import { PluginI18NFieldRender, useActivatedPluginsSNSAdaptor, Widget } from '@masknet/plugin-infra/content-script'
import { useAvailablePlugins } from '@masknet/plugin-infra/web3'
import { Box, Typography } from '@mui/material'

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
                    <Typography variant="h2">
                        <PluginI18NFieldRender field={x.name} pluginID={x.ID} />
                    </Typography>
                    {x.Widgets?.map((y) => (
                        <Widget key={y.ID} pluginID={x.ID} name={y.name} />
                    ))}
                </Box>
            ))}
        </Box>
    )
}
