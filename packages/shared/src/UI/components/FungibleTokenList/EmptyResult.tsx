import { Stack, Typography } from '@mui/material'
import { useSharedI18N } from '../../../locales'
import { EmptySimpleIcon } from '@masknet/icons'

export const EmptyResult = () => {
    const t = useSharedI18N()
    return (
        <Stack justifyContent="center" alignItems="center" gap={1.5}>
            <EmptySimpleIcon size={36} />
            <Typography>{t.erc20_search_empty_result()}</Typography>
        </Stack>
    )
}
