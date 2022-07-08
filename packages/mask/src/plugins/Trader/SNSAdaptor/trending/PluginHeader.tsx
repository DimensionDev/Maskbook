import { TrendingIcon } from '@masknet/icons'
import { Stack, Typography, useTheme } from '@mui/material'
import { Box } from '@mui/system'

interface PluginHeaderProps extends React.PropsWithChildren<{}> {}

export const PluginHeader = ({ children }: PluginHeaderProps) => {
    const t = useTheme()

    return (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <Stack flexDirection="row" justifyContent="space-between" gap={0.5} alignItems="center">
                <TrendingIcon />
                <Typography color={t.palette.maskColor.dark} fontWeight="bolder">
                    Market Trending
                </Typography>
            </Stack>
            <Box>{children}</Box>
        </Stack>
    )
}
