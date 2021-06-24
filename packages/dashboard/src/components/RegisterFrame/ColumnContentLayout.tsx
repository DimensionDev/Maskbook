import { experimentalStyled as styled } from '@material-ui/core/styles'
import { getMaskColor } from '@masknet/theme'
import { InfoOutlined } from '@material-ui/icons'
import { Button, Typography } from '@material-ui/core'
import { useNavigate } from 'react-router'

const Container = styled('div')`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
`

const Header = styled('div')(
    ({ theme }) => `
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    width: 78%;
`,
)

const Body = styled('div')(
    ({ theme }) => `
    flex: 2;
    width: 60%;
    text-align: right;
`,
)

const Footer = styled('div')(
    ({ theme }) => `
    flex: 1;
    width: 78%;
`,
)

const TipContainer = styled('div')(
    ({ theme }) => `
    display: flex;
    align-items: center;
    padding: ${theme.spacing(2.5)};
    background: ${getMaskColor(theme).infoBackground};
    border-radius: ${theme.spacing(1)};

    & > p {
        margin-left: ${theme.spacing(1)};
        margin-bottom: 0;
    }

    & > svg {
        color: ${getMaskColor(theme).secondaryInfoText}};
    }
`,
)

// todo: add i18n
export const ColumnContentLayout: React.FC = ({ children }) => {
    const navigate = useNavigate()

    const handleGoBack = () => {
        navigate(-1)
    }

    return (
        <Container>
            <Header>
                <Button variant={'text'} onClick={handleGoBack}>
                    Go Back
                </Button>
            </Header>
            <Body>{children}</Body>
            <Footer>
                <TipContainer>
                    <InfoOutlined />
                    <Typography variant={'body2'} paragraph>
                        As the defender of open-source software and user data privacy, Mask Network does not collect
                        your private data such as account and password. If you need to retrieve your password, please
                        authorize us to host your account and password. Please rest assured that we simply host your
                        account and password. We do not save any of your private data. Consequently, we cannot restore
                        your data or any other information.
                    </Typography>
                </TipContainer>
            </Footer>
        </Container>
    )
}
