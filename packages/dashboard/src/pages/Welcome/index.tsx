import { FooterLine } from '../../components/FooterLine/FooterLine'
import { Typography, makeStyles, Paper, Button } from '@material-ui/core'
import { MaskNotSquareIcon } from '@masknet/icons'
import { useNavigate } from 'react-router'
import { RoutePaths } from '../../type'

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

export default function Welcome() {
    const classes = useStyles()
    const navigate = useNavigate()

    return (
        <div className={classes.root}>
            <div>
                <Paper className={classes.card}>
                    <Typography>
                        <MaskNotSquareIcon />
                    </Typography>
                    <Typography variant="h3">Help Us Improve Mask Network</Typography>
                    <div>
                        <Typography variant="body1">
                            Mask Network aims to build an encrypted and decentralized social network, you (all Internet
                            users) could send or browse encrypted posts with the ‘Mask Network’ extension or App.
                        </Typography>
                        <Typography>
                            Send encrypted red packets, purchase cryptocurrencies, share encrypted files, etc. More
                            functions are ready to be launched.
                        </Typography>
                    </div>
                    <div>
                        <Button color={'secondary'}>Cancel</Button>
                        <Button color={'primary'} onClick={() => navigate(RoutePaths.SignUp)}>
                            Agree
                        </Button>
                    </div>
                </Paper>
                <FooterLine />
            </div>
        </div>
    )
}
