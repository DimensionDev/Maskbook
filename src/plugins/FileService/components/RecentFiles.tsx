import { Button, List, ListItem, ListItemText, makeStyles, Typography } from '@material-ui/core'
import { map } from 'lodash-es'
import React from 'react'
import { useHistory } from 'react-router'
import type { FileInfo } from '../hooks/Exchange'
import { formatDateTime } from '../utils'

const useStyles = makeStyles({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: 150,
        paddingLeft: 10,
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
        marginLeft: 3,
    },
    primary: {
        fontSize: 12,
        lineHeight: 1.1,
        color: '#14171A',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    secondary: {
        fontSize: 10,
        lineHeight: 1.2,
        color: '#667886',
    },
})

interface Props {
    files: FileInfo[]
    onMore(): void
}

export const RecentFiles: React.FC<Props> = ({ files, onMore }) => {
    const history = useHistory()
    const classes = useStyles()
    const itemClasses = useItemStyles()
    const itemTextClasses = useItemTextStyles()
    const onClick = (info: FileInfo) => () => {
        history.push('/uploaded', info)
    }
    const renderItem = (file: FileInfo, index: number) => (
        <ListItem classes={itemClasses} key={index} onClick={onClick(file)}>
            <img src="https://via.placeholder.com/32x32" />
            <ListItemText
                classes={itemTextClasses}
                primary={file.name}
                secondary={formatDateTime(file.createdAt, true)}
            />
        </ListItem>
    )
    return (
        <section className={classes.container}>
            <Typography className={classes.heading}>Recent Files</Typography>
            <List className={classes.listing}>{map(files.slice(0, 4), renderItem)}</List>
            <Button className={classes.more} onClick={onMore}>
                Show More
            </Button>
        </section>
    )
}
