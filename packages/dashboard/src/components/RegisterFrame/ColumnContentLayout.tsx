import { RestoreBlueIcon, SignUpAccountIcon } from '@masknet/icons'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { memo } from 'react'
import { useDashboardI18N } from '../../locales'

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
    [theme.breakpoints.down('md')]: {
        marginBottom: theme.spacing(2),
    },
}))

export const SignUpAccountLogo = styled(SignUpAccountIcon)(({ theme }) => ({
    width: '100%',
    height: '96px',
})) as any as typeof SignUpAccountIcon

export const RestoreBlueLogo = styled(RestoreBlueIcon)(({ theme }) => ({
    width: '100%',
    height: '96px',
})) as any as typeof RestoreBlueIcon

interface PersonaLogoBoxProps {}

export const PersonaLogoBox = memo<PersonaLogoBoxProps>(({ children }) => {
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
