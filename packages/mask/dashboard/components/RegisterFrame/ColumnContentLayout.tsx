import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDashboardI18N } from '../../locales/index.js'

export const ColumnContentLayout = styled('div')`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
`

export const Body = styled('main')(({ theme }) => ({
    flex: '1 5',
    width: '78%',
    [theme.breakpoints.down('md')]: {
        width: '95%',
    },
}))

export const Footer = styled('footer')(({ theme }) => ({
    flex: 1,
    width: '78%',
    [theme.breakpoints.down('md')]: {
        width: '95%',
    },
}))

export const LogoBoxStyled = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
        marginBottom: theme.spacing(2),
    },
}))

export const SignUpAccountLogo = styled(Icons.SignUpAccount)(({ theme }) => ({
    width: '100%',
    height: '96px',
})) as any as typeof Icons.SignUpAccount

interface PersonaLogoBoxProps {}

export const PersonaLogoBox = memo<React.PropsWithChildren<PersonaLogoBoxProps>>(({ children }) => {
    const t = useDashboardI18N()
    return (
        <LogoBoxStyled>
            {children}
            <Typography variant="h3" textAlign="center">
                {t.persona()}
            </Typography>
        </LogoBoxStyled>
    )
})
