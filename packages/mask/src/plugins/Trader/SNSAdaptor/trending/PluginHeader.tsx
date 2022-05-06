import { useActivatedPlugin, PluginId } from '@masknet/plugin-infra/dom'
import { Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'

interface PluginHeaderProps extends React.PropsWithChildren<{}> {}

export const PluginHeader = ({ children }: PluginHeaderProps) => {
    // TODO: should use definition info for icon
    const trendingDefinition = useActivatedPlugin(PluginId.Trader, 'any')

    return (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight="bolder">Market Trending</Typography>
            </Stack>
            <Box>{children}</Box>
        </Stack>
    )
}
