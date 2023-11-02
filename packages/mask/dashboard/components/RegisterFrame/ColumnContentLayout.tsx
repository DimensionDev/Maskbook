import { memo, type ComponentType } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useDashboardTrans } from '../../locales/index.js'

export const ColumnContentLayout: ComponentType<JSX.IntrinsicElements['div']> = styled('div')`
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
`

export const Body: ComponentType<JSX.IntrinsicElements['main']> = styled('main')(({ theme }) => ({
    flex: '1 5',
    width: '78%',
    [theme.breakpoints.down('md')]: {
        width: '95%',
    },
}))

export const Footer: ComponentType<JSX.IntrinsicElements['footer']> = styled('footer')(({ theme }) => ({
    flex: 1,
    width: '78%',
    [theme.breakpoints.down('md')]: {
        width: '95%',
    },
}))

const LogoBoxStyled = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(10),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
        marginBottom: theme.spacing(2),
    },
})) as any as typeof Box

export const SignUpAccountLogo = styled(Icons.SignUpAccount)(() => ({
    width: '100%',
    height: '96px',
})) as any as typeof Icons.SignUpAccount

export const PersonaLogoBox = memo<React.PropsWithChildren<{}>>(({ children }) => {
    const t = useDashboardTrans()
    return (
        <LogoBoxStyled>
            {children}
            <Typography variant="h3" textAlign="center">
                {t.persona()}
            </Typography>
        </LogoBoxStyled>
    )
})
