import { FooterLine } from '../../components/FooterLine'
import { Card, makeStyles, Paper, Typography } from '@material-ui/core'
import { MaskNotSquareIcon } from '@masknet/icons'

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
    },
    card: {
        padding: '48px 50px',
        margin: 'auto',
        width: 950,
        height: 680,
    },
    constent: {},
}))

export default function SignUp() {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <div>
                <Paper className={classes.card} variant="outlined">
                    <Typography>
                        <MaskNotSquareIcon />
                    </Typography>
                    <Typography variant="h3">Welcome to Mask Network</Typography>
                    <Typography variant="subtitle1">
                        Encrypt your posts & chats on social networks, allow only your friends to decrypt.
                    </Typography>
                    <div>
                        <Card variant="outlined">Creating a new account</Card>
                    </div>
                </Paper>
                <FooterLine />
            </div>
        </div>
    )
}
