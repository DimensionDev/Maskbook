import { memo } from 'react'
import { IconMapping } from './Common'
import { Box, Stack, Typography } from '@mui/material'
import type { SecurityMessage } from '../rules'
import { useI18N } from '../../locales'

interface RiskCardProps {
    info: SecurityMessage
}

export const RiskCard = memo<RiskCardProps>(({ info }) => {
    const t = useI18N()
    return (
        <Stack key={info.titleKey}>
            <Box>{IconMapping[info.level]}</Box>
            <Box>
                <Typography>{t[info.titleKey]()}</Typography>
                <Typography>{t[info.messageKey]()}</Typography>
            </Box>
        </Stack>
    )
})
