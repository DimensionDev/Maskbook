import { Skeleton, Typography, type TypographyProps } from '@mui/material'
import { memo, type ReactNode } from 'react'

export interface ProgressiveTextProps extends Omit<TypographyProps, 'component'> {
    loading?: boolean
    skeletonWidth?: string | number
    skeletonHeight?: string | number
    fallback?: ReactNode
    component?: string
}

export const ProgressiveText = memo(function ProgressiveText({
    loading,
    skeletonWidth,
    skeletonHeight,
    children,
    fallback = '--',
    ...props
}: ProgressiveTextProps) {
    if (loading) {
        return (
            <Typography {...props}>
                <Skeleton
                    animation="wave"
                    variant="text"
                    height={skeletonHeight ?? '1.5em'}
                    width={skeletonWidth ?? '100%'}
                />
            </Typography>
        )
    }

    return <Typography {...props}>{children ?? fallback}</Typography>
})
