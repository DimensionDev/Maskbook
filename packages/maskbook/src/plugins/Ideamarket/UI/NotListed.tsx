import { makeStyles, Typography, Button, Box } from '@material-ui/core'
import type { SyntheticEvent } from 'react'
import type { UIProps } from '../types'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'block',
        width: '160px',
        borderRadius: '10px',
        boxShadow: '0px 0px 3px 1px #ADADAD',
        marginRight: '10%',
        overflow: 'hidden',
        zIndex: 1,
    },
    listButton: {
        backgroundColor: '#2946ba',
        borderRadius: '10px',
        margin: theme.spacing(1),
        width: '53%',
        '&:hover': {
            backgroundColor: '#415bc3',
        },
    },
    buttonText: {
        textTransform: 'none',
        color: 'white',
    },
}))

export default function NotListed(props: UIProps) {
    const classes = useStyles()

    function clicked(e: SyntheticEvent) {
        e.stopPropagation() // This is to prevent event bubbling. Without this, the tweet will also get clicked.
    }

    return (
        <div
            className={classes.root}
            onMouseEnter={() => props.setExtendedHover(true)}
            onMouseLeave={() =>
                setTimeout(() => {
                    props.setExtendedHover(false)
                }, 200)
            }>
            <Box display="flex" bgcolor="#f7f7f7" justifyContent="center">
                <Button
                    onClick={clicked}
                    className={classes.listButton}
                    href="https://app.ideamarket.io/"
                    target="_blank"
                    rel="noopener">
                    <Typography className={classes.buttonText}>List</Typography>
                </Button>
            </Box>
        </div>
    )
}
