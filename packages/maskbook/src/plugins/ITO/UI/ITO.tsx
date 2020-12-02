import type { ITO_JSONPayload } from '../types'
import { makeStyles, createStyles, Card, Typography, Box } from '@material-ui/core'
import BackgroundImage from '../assets/background'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import StyledLinearProgress from './LinearProgressWithLabel'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            position: 'relative',
            color: theme.palette.common.white,
            flexDirection: 'column',
            height: 295,
            boxSizing: 'border-box',
            backgroundAttachment: 'local',
            backgroundPosition: '0 0',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${BackgroundImage})`,
            borderRadius: theme.spacing(1),
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(1),
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(2),
        },
        title: {
            marginBottom: theme.spacing(3),
        },
        totalText: {
            display: 'flex',
            alignItems: 'center',
        },
        totalIcon: {
            marginLeft: theme.spacing(1),
            cursor: 'pointer',
        },
        progressWrap: {
            width: 220,
            margin: `${theme.spacing(4)} 0`,
        },
        footer: {
            display: 'flex',
            marginTop: theme.spacing(1),
            justifyContent: 'space-between',
        },
        fromText: {
            opacity: 0.6,
        },
    }),
)

export interface ITO_Props {
    payload: ITO_JSONPayload
}

export function ITO(props: ITO_Props) {
    const { payload } = props
    const classes = useStyles()

    return (
        <div>
            <Card className={classes.root}>
                <Typography variant="h5" className={classes.title}>
                    {payload.sender.message}
                </Typography>
                <Typography variant="h6" className={''}>
                    1 ETH: 500 Mask
                </Typography>
                <Typography variant="body2" className={classes.totalText}>
                    Total: 1,000.00 / 2,000.00 MASK
                    <OpenInNewIcon fontSize="small" className={classes.totalIcon} />
                </Typography>
                <Box className={classes.progressWrap}>
                    <StyledLinearProgress value={50} />
                </Box>
                <Typography variant="body1">Limit per&nbsp;&nbsp;&nbsp;2 ETH</Typography>
                <Box className={classes.footer}>
                    <Typography variant="body1">Remaining time：1 d&nbsp;&nbsp;3 h&nbsp;&nbsp;30m</Typography>
                    <Typography variant="body1" className={classes.fromText}>
                        From: @Pineapple
                    </Typography>
                </Box>
            </Card>
            {JSON.stringify(payload, null, 2)}
        </div>
    )
}
