import { Paper, Typography, Grid, Link, Box, Divider } from '@material-ui/core'
import { useAccount } from '@masknet/web3-shared'
import { useI18N } from '../../../utils'
import type { NftHistory } from '../types'
import { convertDate } from '../utils'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface Props extends React.PropsWithChildren<{}> {
    histories: NftHistory[]
}

function FoudationProvenances(props: Props) {
    const { t } = useI18N()
    const account = useAccount()
    props.histories.sort((a: NftHistory, b: NftHistory) => {
        if (a.date < b.date) {
            return 1
        }
        if (a.date > b.date) {
            return -1
        }
        return 0
    })
    return (
        <Paper>
            {props.histories.map((history: NftHistory) => (
                <Grid container spacing={0}>
                    <Grid item xs={8}>
                        <Box>
                            <Typography variant="h6">
                                {`${history.event} ${t('plugin_foundation_placed_by')}placed by `}
                                <Link
                                    href={`https://etherscan.io/address/${history.txOrigin.id}`}
                                    color="inherit"
                                    target="_blank">
                                    {account === history.txOrigin.id ? (
                                        <span>{t('plugin_foundation_you_address')}</span>
                                    ) : (
                                        <span>{`${history.txOrigin.id.slice(0, 6)}...${history.txOrigin.id.slice(
                                            -4,
                                        )}`}</span>
                                    )}
                                </Link>
                            </Typography>
                            <Typography variant="caption" display="block" gutterBottom>
                                {convertDate(history.date)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        {history.amountInETH && (
                            <Box>
                                <Typography align="right" variant="h6">
                                    &nbsp;ETH {history.amountInETH}
                                </Typography>
                            </Box>
                        )}
                    </Grid>
                    <Divider>
                        <Link
                            href={`https://etherscan.io/tx/${history.id.split('-')[0]}`}
                            color="inherit"
                            target="_blank">
                            <OpenInNewIcon />
                        </Link>
                    </Divider>
                </Grid>
            ))}
        </Paper>
    )
}

export default FoudationProvenances
