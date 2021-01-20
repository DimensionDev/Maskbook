import { createStyles, makeStyles } from '@material-ui/core'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { COTM_CONSTANTS } from '../constants'
import { useAllTokensOfOwner } from '../hooks/useAllTokensOfOwner'
import { TokenCard } from './TokenCard'

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

export interface TokenAlbumProps {}

export function TokenAlbum(props: TokenAlbumProps) {
    const classes = useStyles(props)

    // fetch the NFT token
    const COTM_TOKEN_ADDRESS = useConstant(COTM_CONSTANTS, 'COTM_TOKEN_ADDRESS')
    const { value: COTM_Token } = useERC721TokenDetailed(COTM_TOKEN_ADDRESS)
    const tokens = useAllTokensOfOwner(COTM_Token)

    if (!tokens.value.length) return null
    return (
        <div className={classes.root}>
            <div className={classes.content}>
                {tokens.value.map((token) => (
                    <section className={classes.tile} key={token.tokenId}>
                        <TokenCard token={token} canViewOnEtherscan />
                    </section>
                ))}
            </div>
        </div>
    )
}
