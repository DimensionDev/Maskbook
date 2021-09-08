import { makeStyles } from '@masknet/theme'

// import { withStyles } from "@material-ui/core/styles";
import { Typography, Divider, LinearProgress } from '@material-ui/core'
import { formatUSDValue } from './web3/utils'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { COLOR_SY_SENIOR_TEXT, COLOR_SY_JUNIOR_TEXT } from '../../constants'

// const StyledLinearProgress = withStyles({
//     colorPrimary: {
//         backgroundColor: COLOR_SY_JUNIOR_TEXT
//     },
//     barColorPrimary: {
//         backgroundColor: COLOR_SY_SENIOR_TEXT
//     }
// })(LinearProgress);

const s = makeStyles()((theme) => ({
    progress: {
        display: 'flex',
        marginTop: 24,
    },
    dataColumn: {
        paddingLeft: 16,
        position: 'relative',
        backgroundColor: 'var(--color)',
        borderRadius: '50%',
        height: 8,
        left: 0,
        top: 4,
        width: 8,
    },
    portfolioAmountContainer: {
        display: 'flex',
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
        justifyContent: 'space-between',
        alignSelf: 'space-between',
        alignContent: 'space-between',
        alignItems: 'space-between',
        flex: 1,
        flexDirection: 'row',
    },
}))

type Props = {
    total?: number
    data: [[string, number | undefined], [string, number | undefined]]
}

const PortfolioBalance: React.FC<Props> = (props: Props) => {
    const { classes } = s()
    const { t } = useI18N()
    const {
        total,
        data: [[label1, value1], [label2, value2]],
    } = props

    const progress = ((value1 ?? 0) * 100) / ((value1 ?? 0) + (value2 ?? 0))

    return (
        <div className="card">
            <div className="card-header">
                <Typography variant="body1" color="#fff">
                    {t('plugin_barnbridge_sy_portfolio_balance')}
                </Typography>
            </div>
            <div className="p-24 flexbox-grid flow-col gap-16">
                <div>
                    <Typography variant="h2" color="#fff">
                        {formatUSDValue(total)}
                    </Typography>
                </div>
            </div>
            <Divider />
            <LinearProgress className={classes.progress} variant="determinate" value={progress} />
            <div className={classes.portfolioAmountContainer}>
                <div style={{ '--color': COLOR_SY_SENIOR_TEXT } as React.CSSProperties}>
                    <Typography variant="subtitle1" color={COLOR_SY_SENIOR_TEXT} className="mb-4">
                        {label1}
                    </Typography>
                    <Typography variant="body1" color="#fff">
                        {formatUSDValue(value1)}
                    </Typography>
                </div>
                <div>
                    <Typography variant="subtitle1" color={COLOR_SY_JUNIOR_TEXT} className="mb-4">
                        {label2}
                    </Typography>
                    <Typography variant="body1" color="#fff">
                        {formatUSDValue(value2)}
                    </Typography>
                </div>
            </div>
        </div>
    )
}

export default PortfolioBalance
