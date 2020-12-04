import { createStyles, makeStyles } from '@material-ui/core'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { COTM_CONSTANTS } from '../constants'
import { useAllCOTM_TokensOfOwner } from '../hooks/useAllCOTM_TokensOfOwner'
import { COTM_Card } from './COTM_Card'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(0, 3),
        },
        content: {
            margin: '0 auto',
            display: 'flex',
            flexFlow: 'row wrap',
            justifyContent: 'flex-start',
            scrollSnapAlign: 'center',
            '&::after': {
                content: '""',
                flex: 'auto',
            },
        },
        tile: {
            padding: theme.spacing(1),
        },
    }),
)

export interface COTM_TokenAlbumProps {}

export function COTM_TokenAlbum(props: COTM_TokenAlbumProps) {
    const classes = useStyles(props)

    // fetch the NFT token
    const COTM_TOKEN_ADDRESS = useConstant(COTM_CONSTANTS, 'COTM_TOKEN_ADDRESS')
    const { value: COTM_Token } = useERC721TokenDetailed(COTM_TOKEN_ADDRESS)
    const tokens = useAllCOTM_TokensOfOwner(COTM_Token)

    const chainIdValid = useChainIdValid()
    if (!chainIdValid) return null
    if (!tokens.value.length) return null
    return (
        <div className={classes.root}>
            <div className={classes.content}>
                {tokens.value.map((token) => (
                    <section className={classes.tile} key={token.tokenId}>
                        <COTM_Card token={token} canViewOnEtherscan />
                    </section>
                ))}
            </div>
        </div>
    )
}
