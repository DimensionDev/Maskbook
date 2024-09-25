import { LoadingBase } from '@masknet/theme'
import { Box, Typography, alpha, useTheme } from '@mui/material'
import { memo, type ReactNode } from 'react'

export const LoadingMask = memo(function LoadingMask({ text }: { text: ReactNode }) {
    const theme = useTheme()

    return (
        <Box
            width={180}
            height={140}
            sx={{ background: theme.palette.maskColor.tips }}
            borderRadius="14px"
            display="flex"
            justifyContent="center"
            flexDirection="column"
            alignItems="center"
            rowGap="10px"
            position="fixed"
            top="calc(50% - 70px)"
            left="calc(50% - 90px)">
            <LoadingBase size={30} color={theme.palette.maskColor.bottom} />
            <Typography
                fontSize={14}
                lineHeight="18px"
                fontWeight={700}
                color={alpha(theme.palette.maskColor.bottom, 0.8)}>
                {text}
            </Typography>
        </Box>
    )
})
