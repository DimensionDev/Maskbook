import { Card, createStyles, Link, makeStyles } from '@material-ui/core'
import { Image } from '../../../components/shared/Image'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { MARKETPLACE_CONSTANTS } from '../constants'
import type { ERC721TokenDetailed } from '../../../web3/types'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            borderRadius: 4,
            position: 'relative',
            backgroundColor: theme.palette.background.paper,
        },
        content: {},
        identifier: {
            color: theme.palette.common.white,
            fontSize: 12,
            borderRadius: 4,
            display: 'block',
            width: '100%',
            textAlign: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            left: 0,
            bottom: 0,
            position: 'absolute',
        },
    }),
)

export interface CommodityCardProps {
    token: ERC721TokenDetailed
    canViewOnEtherscan?: boolean
}

export function Commodity(props: CommodityCardProps) {
    const classes = useStyles(props)
    const chainId = useChainId()
    const TOKEN_ADDRESS = useConstant(MARKETPLACE_CONSTANTS, 'TOKEN_ADDRESS')

    const CardComponent = (
        <Card
            className={classes.root}
            style={{
                width: 160,
                height: 220,
            }}>
            <Image component="img" width={160} height={220} src={''} />
        </Card>
    )

    return props.canViewOnEtherscan && props.token.tokenId ? (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`${resolveLinkOnEtherscan(chainId)}/token/${TOKEN_ADDRESS}?a=${props.token.tokenId}`}>
            {CardComponent}
        </Link>
    ) : (
        CardComponent
    )
}
