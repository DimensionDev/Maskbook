import { Icons } from '@masknet/icons'
import { Stack, Typography, useTheme } from '@mui/material'
import { useSharedI18N } from '@masknet/shared'
import { Box } from '@mui/system'

interface PluginHeaderProps extends React.PropsWithChildren<{}> {}

export const PluginDescriptor = ({ children }: PluginHeaderProps) => {
    const theme = useTheme()
    const t = useSharedI18N()

    return (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
            <Stack flexDirection="row" justifyContent="space-between" gap={0.5} alignItems="center">
                <Icons.DecentralizedSearch />
                <Typography color={theme.palette.maskColor.dark} fontWeight="bolder">
                    {t.decentralized_search_name()}
                </Typography>
            </Stack>
            <Box>{children}</Box>
        </Stack>
    )
}
