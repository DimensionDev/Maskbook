import { RestoreIcon, RestoreBlueIcon, SignUpAccountIcon } from '@masknet/icons'
import { experimentalStyled as styled } from '@material-ui/core/styles'

export const ColumnContentLayout = styled('div')(
    ({ theme }) => `
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
`,
)

export const Body = styled('main')(
    ({ theme }) => `
    flex: 2;
    width: 78%;
`,
)

export const Footer = styled('footer')(
    ({ theme }) => `
    flex: 1;
    width: 78%;
`,
)

export const SignUpAccountLogo = styled(SignUpAccountIcon)(
    ({ theme }) => `
    width: 100%;
    height: 96px;
    margin-bottom: ${theme.spacing(10)};
`,
)

export const RestoreBlueLogo = styled(RestoreBlueIcon)(
    ({ theme }) => `
    width: 100%;
    height: 96px;
    margin-bottom: ${theme.spacing(10)};
`,
)

export const RestoreLogo = styled(RestoreIcon)(
    ({ theme }) => `
    width: 100%;
    height: 96px;
    margin-bottom: ${theme.spacing(10)};
`,
)
