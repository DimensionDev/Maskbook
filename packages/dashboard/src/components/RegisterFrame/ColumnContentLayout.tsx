import { SignUpAccountIcon } from '@masknet/icons'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { getMaskColor } from '@masknet/theme'

export const ColumnContentLayout = styled('div')(
    ({ theme }) => `
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background:  ${getMaskColor(theme).lightBackground}
`,
)

export const Body = styled('div')(
    ({ theme }) => `
    flex: 2;
    width: 78%;
`,
)

export const Footer = styled('div')(
    ({ theme }) => `
    flex: 1;
    width: 78%;
`,
)

export const SignUpAccountLogo = styled(SignUpAccountIcon)(
    ({ theme }) => `
    width: 100%;
    height: 96px;
    margin-bottom: 100px;
`,
)

// interface ColumnContentLayoutProps extends React.PropsWithChildren<{}>, HeaderUIProps {}

// export const ColumnContentLayout = memo(({ title, action, children }: ColumnContentLayoutProps) => {
//     return (
//         <Container>
//             <Header title={title} action={action} />
//             <Body>{children}</Body>
//             <Footer></Footer>
//         </Container>
//     )
// })
