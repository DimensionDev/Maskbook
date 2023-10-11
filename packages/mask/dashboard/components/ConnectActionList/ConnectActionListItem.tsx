import { ListItemIcon, ListItemText, styled, ListItemButton } from '@mui/material'
import { MaskColorVar } from '@masknet/theme'
import type { ReactNode } from 'react'

export interface ConnectActionListItemProps {
    title: string
    icon: ReactNode
    onClick(): void
}

export function ConnectActionListItem(props: ConnectActionListItemProps) {
    const { title, icon, onClick } = props
    return (
        <Container onClick={onClick}>
            <Dot />
            <ListItemText primary={title} />
            <Icon>{icon}</Icon>
        </Container>
    )
}

const Icon = styled(ListItemIcon)`
    font-size: 48px;
`

const Container = styled(ListItemButton)`
    border: 1px solid ${MaskColorVar.border};
    border-radius: 8px;
`

const Dot = styled('div')(
    ({ theme }) => `
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${MaskColorVar.iconLight};
    margin-right: ${theme.spacing(2)};
`,
)
