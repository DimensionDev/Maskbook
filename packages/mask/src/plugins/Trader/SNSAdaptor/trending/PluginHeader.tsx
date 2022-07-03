import { MarketTrend as TrendingIcon } from '@masknet/icons'
import { Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'

interface PluginHeaderProps extends React.PropsWithChildren<{}> {}

export const PluginHeader = ({ children }: PluginHeaderProps) => {
    return (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <Stack flexDirection="row" justifyContent="space-between" gap={0.5} alignItems="center">
                <TrendingIcon />
                <Typography fontWeight="bolder">Market Trending</Typography>
            </Stack>
            <Box>{children}</Box>
        </Stack>
    )
}
