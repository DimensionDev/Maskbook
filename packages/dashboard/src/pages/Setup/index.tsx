import { ColumnLayout } from '../../components/RegisterFrame/ColumnLayout'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Button, Card, Typography } from '@material-ui/core'

const Content = styled('div')(
    ({ theme }) => `
    padding: ${theme.spacing(1)} ${theme.spacing(8)};
`,
)

const Header = styled('header')(
    ({ theme }) => `
    padding-bottom: ${theme.spacing(4)};
`,
)

const Title = styled('div')(
    ({ theme }) => `
    text-align: center;
    padding: ${theme.spacing(3)} 0 0 0;
`,
)

const ActionCards = styled('div')(
    ({ theme }) => `
    margin: 0 auto;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
    width: 400px;
`,
)

const ActionCardContainer = styled(Card)(
    ({ theme }) => `
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: ${theme.spacing(2.5)};
    margin-bottom: ${theme.spacing(2.5)};

    & > div > p {
        margin-bottom: 0;
    }
`,
)

const ActionCardIcon = styled('div')(
    ({ theme }) => `
    margin-right: ${theme.spacing(1)};
`,
)
const ActionCardButton = styled('div')(
    ({ theme }) => `
    margin-left: ${theme.spacing(1)};
    font-size: 14px;
`,
)

interface ISetupActionCardProps {
    icon: string
    title: string
    subtitle: string
    action: {
        type: 'secondary' | 'primary'
        text: string
    }
}

const SetupActionCard: React.FC<ISetupActionCardProps> = ({ icon, title, subtitle, action }) => {
    return (
        <ActionCardContainer variant={'outlined'}>
            <ActionCardIcon>icon</ActionCardIcon>
            <div>
                <Typography variant={'body1'} paragraph>
                    {title}
                </Typography>
                <Typography variant={'body2'} paragraph>
                    {subtitle}
                </Typography>
            </div>
            <ActionCardButton>
                <Button size={'small'} variant={'contained'} color={action.type}>
                    {action.text}
                </Button>
            </ActionCardButton>
        </ActionCardContainer>
    )
}

// todo: dark theme style
const Setup = () => {
    return (
        <ColumnLayout>
            <Content>
                <Header>
                    <Title>
                        <Typography variant="h3">Welcome to Mask Network</Typography>
                    </Title>
                    <Typography variant="body2" paragraph>
                        Encrypt your posts & chats on social networks, allow only your friends to decrypt.
                    </Typography>
                </Header>
                <ActionCards>
                    <SetupActionCard
                        title={'Creating a new account'}
                        subtitle={'Local storage of accounts and data.'}
                        icon={'icon'}
                        action={{
                            type: 'primary',
                            text: 'Sign Up',
                        }}
                    />
                    <SetupActionCard
                        title={'Creating a new account'}
                        subtitle={'Local storage of accounts and data.'}
                        icon={'icon'}
                        action={{
                            type: 'primary',
                            text: 'Sign Up',
                        }}
                    />
                    <SetupActionCard
                        title={'Creating a new account'}
                        subtitle={'Local storage of accounts and data.'}
                        icon={'icon'}
                        action={{
                            type: 'primary',
                            text: 'Sign Up',
                        }}
                    />
                </ActionCards>
            </Content>
        </ColumnLayout>
    )
}

export default Setup
