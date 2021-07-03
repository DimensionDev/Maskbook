import { memo } from 'react'
import { experimentalStyled as styled } from '@material-ui/core/styles'
import { Button, Typography } from '@material-ui/core'

const HeaderContainer = styled('div')(
    ({ theme }) => `
    flex: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 78%;
`,
)

export interface HeaderUIProps {
    title: string
    action: {
        name: string
        callback(): void
    }
}

export const Header = memo(({ title, action }: HeaderUIProps) => {
    return (
        <HeaderContainer>
            <Typography variant={'h3'}>{title}</Typography>
            <Button variant={'text'} onClick={() => action.callback()}>
                {action.name}
            </Button>
        </HeaderContainer>
    )
})
