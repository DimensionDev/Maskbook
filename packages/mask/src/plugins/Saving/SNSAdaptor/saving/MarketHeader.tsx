import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils'

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
    title: {
        fontSize: 15,
    },
}))

export function MarketHeader() {
    const { t } = useI18N()
    const { classes } = useStyles()
    return (
        <div className={classes.wrap}>
            <div className={classes.wrapItemFirst}>
                <span className={classes.symbol}>Type</span>
            </div>
            <div className={classes.wrapItem}>
                <span>APY</span>
            </div>
            <div className={classes.wrapItem}>
                <span>Wallet</span>
            </div>

            <div>
                <span>Operation</span>
            </div>
        </div>
    )
}
