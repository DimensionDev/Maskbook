import type { ITO_JSONPayload } from '../types'
import { makeStyles, createStyles, Card, Typography, Box } from '@material-ui/core'
import BackgroundImage from '../assets/background'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import { StyledLinearProgress } from './StyledLinearProgress'
import { EthIcon, DaiIcon, UsdcIcon, UsdtIcon } from '../assets/tokenIcon'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            position: 'relative',
            color: theme.palette.common.white,
            flexDirection: 'column',
            height: 340,
            boxSizing: 'border-box',
            backgroundAttachment: 'local',
            backgroundPosition: '0 0',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundImage: `url(${BackgroundImage})`,
            borderRadius: theme.spacing(1),
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(1),
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(2),
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            marginBottom: 4,
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
            marginBottom: theme.spacing(3),
            marginTop: theme.spacing(1),
        },
        footer: {
            position: 'absolute',
            width: 425,
            bottom: theme.spacing(2),
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        fromText: {
            opacity: 0.6,
        },
        rateWrap: {
            marginBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& > span': {
                marginLeft: theme.spacing(1),
                fontSize: 14,
                '& > b': {
                    fontSize: 16,
                    fontWeight: 'bold',
                },
            },
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
                <Typography variant="body2" className={classes.totalText}>
                    Sold 30,000.00 Sell Total Amount 200,000.00 MASK
                    <OpenInNewIcon fontSize="small" className={classes.totalIcon} />
                </Typography>
                <Box className={classes.progressWrap}>
                    <StyledLinearProgress variant="determinate" value={50} />
                </Box>
                <Box>
                    <div className={classes.rateWrap}>
                        <EthIcon />
                        <span>
                            <b>0.001</b> ETH / MASK
                        </span>
                    </div>
                    <div className={classes.rateWrap}>
                        <DaiIcon />
                        <span>
                            <b>0.1</b> USDT / MASK
                        </span>
                    </div>
                    <div className={classes.rateWrap}>
                        <UsdcIcon />
                        <span>
                            <b>0.1</b> DAI / MASK
                        </span>
                    </div>
                    <div className={classes.rateWrap}>
                        <UsdtIcon />
                        <span>
                            <b>0.1</b> USDC / MASK
                        </span>
                    </div>
                </Box>
                <Box className={classes.footer}>
                    <div>
                        <Typography variant="body1">limit per：200 MASK</Typography>
                        <Typography variant="body1">Remaining time：1 d&nbsp;&nbsp;3 h&nbsp;&nbsp;30m</Typography>
                    </div>
                    <Typography variant="body1" className={classes.fromText}>
                        From: @Pineapple
                    </Typography>
                </Box>
            </Card>
            {JSON.stringify(payload, null, 2)}
        </div>
    )
}
