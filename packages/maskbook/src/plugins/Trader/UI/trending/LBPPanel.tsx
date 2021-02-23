import { LBPPriceChart } from './LBPPriceChart'
import { Theme, createStyles, makeStyles, Link, Button, Typography } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'
import type { ERC20TokenDetailed } from '../../../../web3/types'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            paddingBottom: theme.spacing(2),
        },
        introduce: {
            fontSize: 14,
            margin: theme.spacing(1, 0),
            padding: theme.spacing(0, 2.5),
        },
        connect: {
            padding: theme.spacing(0, 2.5),
            display: 'flex',
            justifyContent: 'flex-end',
            '& > div': {
                width: 'auto',
            },
        },
    }),
)

export interface LBPPanelProps extends withClasses<never> {
    token: ERC20TokenDetailed
    onBuyClick(): void
}

export function LBPPanel(props: LBPPanelProps) {
    const { token } = props
    const classes = useStylesExtends(useStyles(props), props)

    return (
        <div className={classes.container}>
            <LBPPriceChart />
            <Typography className={classes.introduce}>
                Solid blue line illustrates the historical price of MASK on the {token.symbol}'s LBP. Dashed line represents the
                future price <strong>if no one buys MASK We do not advise </strong>
                buying ${token.symbol} at the very beginning of the LBP offering
            </Typography>
            <Typography className={classes.introduce}>
                <Link>What's LBP</Link>, <Link>Tutorial </Link>
                    and
                    <Link> {token.symbol} LBP Pool in Balancer.</Link>
            </Typography>
            <div className={classes.connect}>
                <Button variant="contained" onClick={props.onBuyClick}>
                    Buy
                </Button>
            </div>
        </div>
    )
}
