import type { CompoundMarket } from '../../contracts/compound/useCompound'
import { makeStyles } from '@masknet/theme'
import { Button } from '@mui/material'
import { useI18N } from '../../../../utils'
import { formatBalance } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => ({
    wrap: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: theme.palette.mode === 'light' ? '#F6F8F8' : '#17191D',
        padding: '12px 24px',
        borderRadius: 8,
        marginBottom: 12,
    },
    wrapItem: {
        flex: 2,
    },
    wrapItemFirst: {
        flex: 3,
        display: 'flex',
        alignItems: 'center',
    },
    symbol: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 500,
    },
    contractName: {
        fontSize: 16,
        lineHeight: '24px',
        opacity: 0.7,
    },
    tokenIcon: {
        width: 36,
        height: 36,
        marginRight: 12,
        '> svg': {
            width: '100%',
            height: '100%',
        },
    },
}))

export default function CompoundMarketItem({
    market,
    onClick,
    isWithdrawTab,
}: {
    market: CompoundMarket
    onClick: () => void
    isWithdrawTab?: boolean
}) {
    const { t } = useI18N()
    const { classes } = useStyles()
    // const Icon = Icons[market.underlying.symbol as any]
    return (
        <div className={classes.wrap}>
            <div className={classes.wrapItemFirst}>
                <div className={classes.tokenIcon}>{/* <Icon width="30" /> */}</div>
                <div>
                    <span className={classes.symbol}>{market.underlying.symbol}</span>
                    <br />
                    <span className={classes.contractName}>Compound</span>
                </div>
            </div>
            <div className={classes.wrapItem}>
                <span>{market.cToken.supplyApy !== undefined ? `${market.cToken.supplyApy.toFixed(2)}%` : '0.0%'}</span>
            </div>
            <div className={classes.wrapItem}>
                <span>
                    {formatBalance(
                        isWithdrawTab ? market.cToken.balance : market.underlying.balance,
                        isWithdrawTab ? market.cToken.decimals : market.underlying.decimals,
                        2,
                    )}
                </span>
            </div>

            <div>
                <Button color="primary" variant="contained" size="small" onClick={onClick}>
                    {isWithdrawTab ? 'Withdraw' : 'Supply'}
                </Button>
            </div>
        </div>
    )
}
