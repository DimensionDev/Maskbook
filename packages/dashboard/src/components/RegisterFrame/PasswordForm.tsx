import { Box, Typography } from '@material-ui/core'
import { experimentalStyled as styled } from '@material-ui/core/styles'

interface IPasswordFormProps {
    title: string
    subtitle: string
}

const Container = styled('div')(
    ({ theme }) => `
`,
)
const Title = styled(Typography)(
    ({ theme }) => `
        padding-bottom: ${theme.spacing(4)};
`,
)
const Subtitle = styled(Typography)(
    ({ theme }) => `
        padding-bottom: ${theme.spacing(7)};
`,
)

export const PasswordForm: React.FC<IPasswordFormProps> = ({ title, subtitle, children }) => {
    return (
        <Container>
            <Title variant={'h3'}>{title}</Title>
            {subtitle && (
                <Subtitle variant={'body2'} paragraph>
                    {subtitle}
                </Subtitle>
            )}
            <Box component="form" noValidate autoComplete="off">
                {children}
            </Box>
        </Container>
    )
}
