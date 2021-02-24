import { experimentalStyled as styled, listItemClasses } from '@material-ui/core'

export const ConnectActionList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    width: 520,
    [`& .${listItemClasses.root}`]: {
        marginBottom: theme.spacing(1.5),
    },
}))

export * from './ConnectActionListItem'
