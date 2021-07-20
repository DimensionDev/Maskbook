import { memo } from 'react'
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

interface ColumnContentLayoutProps extends React.PropsWithChildren<{}> {}

export const ColumnContentLayout = memo(({ children }: ColumnContentLayoutProps) => {
    const navigate = useNavigate()
    const handleGoBack = () => navigate(-1)

    return (
        <Container>
            <Header>
                <Button variant="text" onClick={handleGoBack}>
                    Go Back
                </Button>
            </Header>
            <Body>{children}</Body>
            <Footer>
                <TipContainer>
                    <InfoOutlined />
                    <Typography variant="body2" paragraph>
                        footer
                    </Typography>
                </TipContainer>
            </Footer>
        </Container>
    )
})
