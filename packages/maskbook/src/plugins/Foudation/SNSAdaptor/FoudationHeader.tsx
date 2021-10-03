import { CurrentPrice } from '../utils'
import type { nftData } from '../types'
import { CardHeader, Link, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils'

interface Props extends React.PropsWithChildren<{}> {
    nftData: nftData
}

function FoudationHeader(props: Props) {
    const { t } = useI18N()
    return (
        <CardHeader
            title={
                <Link color="inherit" target="_blank" rel="noopener noreferrer" href={props.nftData.link}>
                    <Typography variant="h3" align="center">
                        {props.nftData.metadata.name}
                    </Typography>
                </Link>
            }
            subheader={
                <Typography variant="h5" align="center" color="text.secondary">
                    {CurrentPrice(t, props.nftData.graph.data.nfts[0].mostRecentAuction)}
                </Typography>
            }
        />
    )
}

export default FoudationHeader
