import { Container, List, ListItem, ListItemText, makeStyles, Button } from '@material-ui/core'
import React from 'react'

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

export const RecentFiles: React.FC = () => {
    const classes = useStyles()
    const itemClasses = useItemStyles()
    const itemTextClasses = useItemTextStyles()
    return (
        <Container className={classes.container}>
            <h1 className={classes.heading}>Recent Files</h1>
            <List className={classes.listing}>
                <ListItem classes={itemClasses}>
                    <ListItemText classes={itemTextClasses} primary="Work" secondary="Jan 7, 2014" />
                </ListItem>
                <ListItem classes={itemClasses}>
                    <ListItemText classes={itemTextClasses} primary="Work" secondary="Jan 7, 2014" />
                </ListItem>
                <ListItem classes={itemClasses}>
                    <ListItemText classes={itemTextClasses} primary="Work" secondary="Jan 7, 2014" />
                </ListItem>
            </List>
            <Button className={classes.more}>Show More</Button>
        </Container>
    )
}
