import { memo } from 'react'
import { styled } from '@material-ui/core/styles'
import { Button, Typography } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'

const HeaderContainer = styled('header')(({ theme }) => ({
    flex: '5 1',
    width: '78%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxHeight: '30%',
    minHeight: '15%',
    [theme.breakpoints.down('md')]: {
        width: '95%',
    },
}))

const TitleContainer = styled('div')(
    ({ theme }) => `
    display: flex;
    justify-content: space-between;
    align-items: center;
`,
)

const Subtitle = styled(Typography)(
    ({ theme }) => `
    padding-top: 30px;
    color: ${theme.palette.mode === 'dark' ? MaskColorVar.textSecondary.alpha(0.8) : MaskColorVar.textPrimary}
`,
)

const Action = styled(Button)(({ theme }) => ({
    display: 'inline-block',
    color: theme.palette.mode === 'dark' ? MaskColorVar.textPrimary : MaskColorVar.primary,
    fontWeight: 'bold',
    textAlign: 'right',
    '&:hover': {
        background: 'transparent',
    },
}))

export interface HeaderProps {
    title: string
    subtitle?: string
    action: {
        name: string
        callback(): void
    }
}

export const Header = memo(({ title, subtitle, action }: HeaderProps) => {
    return (
        <HeaderContainer>
            <TitleContainer>
                <Typography variant="h3">{title}</Typography>
                <Action variant="text" onClick={() => action.callback()}>
                    {action.name}
                </Action>
            </TitleContainer>
            {subtitle && <Subtitle variant="h5">{subtitle}</Subtitle>}
        </HeaderContainer>
    )
})
