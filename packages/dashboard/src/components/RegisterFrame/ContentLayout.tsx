import { experimentalStyled as styled } from '@material-ui/core/styles'

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

// todo: add i18n
export const ContentLayout: React.FC = ({ children }) => {
    return (
        <Container>
            <Header>Go Back</Header>
            <Body>{children}</Body>
            <Footer>notification</Footer>
        </Container>
    )
}
