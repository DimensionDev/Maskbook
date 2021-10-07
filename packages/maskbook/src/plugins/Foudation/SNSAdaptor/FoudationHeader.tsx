import { CurrentPrice } from '../utils'
import type { Nft, Metadata } from '../types'
import { CardHeader, Link, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils'

interface Props extends React.PropsWithChildren<{}> {
    nft: Nft[] | undefined
    metadata: Metadata | undefined
    link: string
}
// nftData.graph.data.nfts[0].mostRecentAuction)}
function FoudationHeader(props: Props) {
    const { t } = useI18N()
    return (
        <CardHeader
            title={
                <Link color="inherit" target="_blank" rel="noopener noreferrer" href={props.link}>
                    <Typography variant="h3" align="center">
                        {props.metadata?.name}
                    </Typography>
                </Link>
            }
            subheader={
                <Typography variant="h5" align="center" color="text.secondary">
                    {props.nft && CurrentPrice(t, props.nft[0].mostRecentAuction)}
                </Typography>
            }
        />
    )
}

export default FoudationHeader
