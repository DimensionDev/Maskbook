import { DialogTitle, IconButton, Typography, Box, experimentalStyled as styled } from '@material-ui/core'
import { Close, ArrowBack } from '@material-ui/icons'
import { memo } from 'react'

const Title = styled(DialogTitle)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    // gap: theme.spacing(1), // ? Safari doesn't support it
    '& > *:first-child': { marginRight: theme.spacing(1) },
}))
export interface MaskDialogTitleProps {
    children: string
    onBack?(): void
    onClose?(): void
}
export const MaskDialogTitle = memo((props: MaskDialogTitleProps) => {
    const { children, onBack, onClose } = props
    const backButton = onBack ? (
        <IconButton onClick={onBack} edge="start" color="inherit">
            <ArrowBack />
        </IconButton>
    ) : null
    const closeButton = onClose ? (
        <IconButton onClick={onClose} edge="end" color="inherit">
            <Close />
        </IconButton>
    ) : null
    return (
        <Title disableTypography>
            {backButton}
            <Typography component="h2" variant="h6">
                {children}
            </Typography>
            <Box sx={{ flex: 1 }} />
            {closeButton}
        </Title>
    )
})
