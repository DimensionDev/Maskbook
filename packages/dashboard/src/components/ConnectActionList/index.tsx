import { styled, listItemClasses } from '@material-ui/core'

export const ConnectActionList = styled('ul')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    listStyle: 'none',
    padding: 0,
    // TODO: mobile
    width: 520,
    // TODO: deep style
    [`& .${listItemClasses.root}`]: {
        marginBottom: theme.spacing(1.5),
    },
}))

export * from './ConnectActionListItem'
