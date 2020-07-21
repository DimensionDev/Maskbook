import { Typography, Container, List, ListItem, ListItemText, makeStyles, Button } from '@material-ui/core'
import React from 'react'
import { map } from 'lodash-es'
import { formatDateTime } from '../utils'
import { useHistory } from 'react-router'

const useStyles = makeStyles({
    container: {
        paddingLeft: 10,
        paddingRight: 10,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    heading: {
        fontSize: 14,
        lineHeight: 1.1,
        color: '#000',
        userSelect: 'none',
        marginTop: 0,
        marginBottom: 10,
    },
    listing: {
        flex: 1,
    },
    more: {
        fontSize: 14,
        lineHeight: 1.2,
        color: '#2CA4EF',
    },
})

const useItemStyles = makeStyles({
    root: {
        padding: 0,
        paddingBottom: 10,
        userSelect: 'none',
    },
})

const useItemTextStyles = makeStyles({
    root: {
        margin: 0,
    },
    primary: {
        fontSize: 12,
        lineHeight: 1.2,
        color: '#14171A',
    },
    secondary: {
        fontSize: 10,
        lineHeight: 1.2,
        color: '#667886',
    },
})

interface Props {
    files: FileInfo[]
}

export interface FileInfo {
    id: string
    name: string
    createdAt: Date
}

export const RecentFiles: React.FC<Props> = ({ files }) => {
    const history = useHistory()
    const classes = useStyles()
    const itemClasses = useItemStyles()
    const itemTextClasses = useItemTextStyles()
    const onClick = (id: string) => () => {
        history.push(`/file/${id}`)
    }
    const renderItem = (file: FileInfo, index: number) => (
        <ListItem classes={itemClasses} key={index} onClick={onClick(file.id)}>
            <ListItemText classes={itemTextClasses} primary={file.name} secondary={formatDateTime(file.createdAt)} />
        </ListItem>
    )
    return (
        <Container className={classes.container}>
            <Typography className={classes.heading}>Recent Files</Typography>
            <List className={classes.listing}>{map(files.slice(0, 4), renderItem)}</List>
            <Button className={classes.more}>Show More</Button>
        </Container>
    )
}
