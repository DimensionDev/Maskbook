import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDashboardI18N } from '../../locales/index.js'

const LogoBoxStyled = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'qcenter',
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
