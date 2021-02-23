import { LBPPriceChart } from './LBPPriceChart'
import { Theme, createStyles, makeStyles, Link, Button } from '@material-ui/core'
import { useStylesExtends } from '../../../../components/custom-ui-helper'
import { EthereumWalletConnectedBoundary } from '../../../../web3/UI/EthereumWalletConnectedBoundary'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            paddingBottom: theme.spacing(2),
        },
        introduce: {
            fontSize: 14,
            marginTop: theme.spacing(2),
            padding: theme.spacing(0, 2.5),
        },
        connect: {
            marginTop: theme.spacing(2),
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
    onBuyClick(): void
}

export function LBPPanel(props: LBPPanelProps) {
    const classes = useStylesExtends(useStyles(props), props)

    return (
        <div className={classes.container}>
            <LBPPriceChart />
            <div className={classes.introduce}>
                Solid blue line illustrates the historical price of MASK on the MASK's LBP. Dashed line represents the
                future price <strong>if no one buys MASK We do not advise </strong>
                buying $MASK at the very beginning of the LBP offering
                <div>
                    <Link>What's LBP</Link>,<Link>Tutorial </Link>
                    and
                    <Link> MASK LBP Pool in Balancer.</Link>
                </div>
            </div>
            <div className={classes.connect}>
                <EthereumWalletConnectedBoundary>
                    <Button variant="contained" onClick={props.onBuyClick}>
                        Buy
                    </Button>
                </EthereumWalletConnectedBoundary>
            </div>
        </div>
    )
}
