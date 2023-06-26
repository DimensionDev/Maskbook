import { LoadingStatus } from '@masknet/shared'
import { Card } from '@mui/material'
import { memo } from 'react'

interface LoadingProps {
    text?: string
}

export const LoadingCard = memo(function LoadingCard({ text = 'Loading' }: LoadingProps) {
    return (
        <Card variant="background" sx={{ width: '100%' }}>
            <LoadingStatus>{text}</LoadingStatus>
        </Card>
    )
})
