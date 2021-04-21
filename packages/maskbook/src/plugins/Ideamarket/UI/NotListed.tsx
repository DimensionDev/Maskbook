import { makeStyles, Typography, Button, Link, Divider, Box } from '@material-ui/core'
import type { UIProps } from '../types'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'block',
        width: '160px',
        borderRadius: '10px',
        boxShadow: '0px 0px 3px 1px #ADADAD',
        marginRight: '10%',
        overflow: 'hidden',
    },
    topBox: {
        backgroundColor: '#f7f7f7',
        overflow: 'hidden',
    },
    listButton: {
        backgroundColor: '#2946ba',
        borderRadius: '10px',
        margin: theme.spacing(1),
        width: '53%',
    },
    topText: {
        margin: theme.spacing(1),
        color: '#2946ba',
    },
    buttonText: {
        textTransform: 'none',
        color: 'white',
    },
    bottomText: {
        fontSize: [12, '!important'],
        color: 'black',
    },
}))

export default function NotListed(props: UIProps) {
    const classes = useStyles()

    return (
        <div
            className={classes.root}
            onMouseEnter={() => props.setExtendedHover(true)}
            onMouseLeave={() =>
                setTimeout(() => {
                    props.setExtendedHover(false)
                }, 200)
            }>
            <Box className={classes.topBox} display="flex" justifyContent="center">
                <Typography className={classes.topText}>
                    <b>Unlisted</b>
                </Typography>
            </Box>
            <Divider />
            <Box display="flex" bgcolor="#f7f7f7" justifyContent="center">
                <Link href="https://ideamarket.io/" target="_blank" rel="noopener" style={{ textDecoration: 'none' }}>
                    <Button onClick="window.open('https://ideamarket.io/')" className={classes.listButton}>
                        <Typography className={classes.buttonText}>List</Typography>
                    </Button>
                </Link>
            </Box>
        </div>
    )
}
