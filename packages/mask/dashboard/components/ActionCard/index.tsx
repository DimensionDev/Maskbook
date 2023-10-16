import type { ReactNode } from 'react'
import { Box, Button, Card, Stack, Typography } from '@mui/material'
import { experimentalStyled as styled } from '@mui/material/styles'

const ActionCardIcon = styled('div')(
    ({ theme }) => `
    width: 36px;
    height: 36px;

    & > svg,
    & > span {
        width: 100%;
        height: 100%;
    }
`,
)

const ActionCardButton = styled('div')(
    ({ theme }) => `
    font-size: 14px;

    & > button {
        width: 164px;
        border-radius: ${theme.spacing(3)};
    }
`,
)

interface ISetupActionCardProps {
    icon: ReactNode
    title: string
    subtitle?: string
    action: {
        type: 'secondary' | 'primary'
        text: string
        handler: () => void
    }
}

export function ActionCard({ icon, title, subtitle, action }: ISetupActionCardProps) {
    return (
        <Card
            variant="outlined"
            sx={{
                padding: (theme) => theme.spacing(2.5),
                marginBottom: (theme) => theme.spacing(2.5),
                boxShadow: 'none',
            }}>
            <Stack spacing={2} direction="row" alignItems="center" justifyContent="space-between" width="100%">
                <ActionCardIcon>{icon}</ActionCardIcon>
                <Box flex={1}>
                    <Typography variant="body1" paragraph sx={{ marginBottom: 0 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ marginBottom: 0 }}>
                        {subtitle}
                    </Typography>
                </Box>
                <ActionCardButton>
                    <Button size="medium" variant="contained" color={action.type} onClick={action.handler}>
                        {action.text}
                    </Button>
                </ActionCardButton>
            </Stack>
        </Card>
    )
}
