import Tilt from 'react-tilt'
import { Card, createStyles, Link, makeStyles } from '@material-ui/core'
import type { COTM_Token } from '../types'
import { Image } from '../../../components/shared/Image'
import { resolveLinkOnEtherscan } from '../../../web3/pipes'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { COTM_CONSTANTS } from '../constants'

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

export interface COTM_CardProps {
    token: COTM_Token
    canViewOnEtherscan?: boolean
}

export function COTM_Card(props: COTM_CardProps) {
    const classes = useStyles(props)
    const chainId = useChainId()
    const COTM_TOKEN_ADDRESS = useConstant(COTM_CONSTANTS, 'COTM_TOKEN_ADDRESS')

    const CardComponent = (
        <Tilt options={{ scale: 1, max: 30, glare: true, 'max-glare': 1, speed: 1000 }}>
            <Card
                className={classes.root}
                style={{
                    width: 160,
                    height: 220,
                }}>
                <Image component="img" width={160} height={220} src={props.token.tokenImageURL} />
            </Card>
        </Tilt>
    )
    return props.canViewOnEtherscan && props.token.tokenId ? (
        <Link
            target="_blank"
            rel="noopener noreferrer"
            href={`${resolveLinkOnEtherscan(chainId)}/token/${COTM_TOKEN_ADDRESS}?a=${props.token.tokenId}`}>
            {CardComponent}
        </Link>
    ) : (
        CardComponent
    )
}
