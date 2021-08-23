import { memo } from 'react'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Button, Typography } from '@material-ui/core'
import { MaskColorVar } from '@masknet/theme'

const HeaderContainer = styled('header')(
    ({ theme }) => `
    flex: 1;
    width: 78%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 30%;
    min-height: 25%;`,
)

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
`,
)

const Action = styled(Button)(
    ({ theme }) => `
    color: ${theme.palette.mode === 'dark' ? MaskColorVar.textPrimary : MaskColorVar.primary};
    font-weight: bold;
`,
)

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
