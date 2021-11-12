import { Typography, Link, Box, Divider, Grid } from '@mui/material'
import { useAccount } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils'
import type { NftHistory } from '../types'
import { convertDate } from '../utils'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'

interface Props extends React.PropsWithChildren<{}> {
    histories: NftHistory[]
}

function FoundationProvenances(props: Props) {
    const { t } = useI18N()
    const account = useAccount()
    const histories = props.histories.sort((first: NftHistory, second: NftHistory) => {
        if (first.date < second.date) {
            return 1
        }
        if (first.date > second.date) {
            return -1
        }
        return 0
    })
    return (
        <Box>
            {histories.map((history: NftHistory) => (
                <Box>
                    <Grid container spacing={2}>
                        <Grid item xs={8}>
                            <Box>
                                <Typography variant="h6">
                                    {`${history.event} ${t('plugin_foundation_by')} `}
                                    <Link
                                        href={`https://etherscan.io/address/${history.txOrigin.id}`}
                                        color="inherit"
                                        target="_blank">
                                        {account === history.txOrigin.id ? (
                                            <span>{t('plugin_foundation_you_address')}</span>
                                        ) : (
                                            <span>{formatEthereumAddress(history.txOrigin.id, 4)}</span>
                                        )}
                                    </Link>
                                </Typography>
                                <Typography style={{ width: '100%' }} variant="caption" display="block" gutterBottom>
                                    {convertDate(history.date)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            {history.amountInETH !== null && (
                                <Box>
                                    <Typography align="right" variant="h6">
                                        &nbsp;ETH {history.amountInETH}
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                    <Divider style={{ width: '100%' }}>
                        <Link
                            href={`https://etherscan.io/tx/${history.id.split('-')[0]}`}
                            color="inherit"
                            target="_blank">
                            <OpenInNewIcon />
                        </Link>
                    </Divider>
                </Box>
            ))}
        </Box>
    )
}

export default FoundationProvenances
