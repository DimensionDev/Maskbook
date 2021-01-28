import { createStyles, makeStyles, Typography } from '@material-ui/core'
import { useConstant } from '../../../web3/hooks/useConstant'
import { COTM_CONSTANTS } from '../constants'
import { useAllTokensOfOwner } from '../hooks/useAllTokensOfOwner'
import { TokenCard } from './TokenCard'
import { useI18N } from '../../../utils/i18n-next-ui'
import { getERC721TokenDetailed } from '../../../web3/suspends/getERC721TokenDetailed'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useERC721TokenContract } from '../../../web3/contracts/useERC721TokenContract'
import { useSingleContractMultipleData } from '../../../web3/hooks/useMulticall'
import type { ERC721 } from '../../../contracts/ERC721'

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

export interface TokenAlbumProps {
    setCollectiblesLoading?: (loading: boolean) => void
}

export function TokenAlbum(props: TokenAlbumProps) {
    const classes = useStyles(props)

    // fetch the NFT token
    const COTM_TOKEN_ADDRESS = useConstant(COTM_CONSTANTS, 'COTM_TOKEN_ADDRESS')
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(COTM_TOKEN_ADDRESS)
    const names = ['name', 'symbol', 'baseURI'] as (keyof ERC721['methods'])[]
    const callDatas = new Array(3).fill([])
    const [results, calls, _, callback] = useSingleContractMultipleData(erc721TokenContract, names, callDatas)
    const COTM_Token = getERC721TokenDetailed(chainId, COTM_TOKEN_ADDRESS, results, callback, calls)
    const tokens = useAllTokensOfOwner(COTM_Token)
    const { t } = useI18N()
    return (
        <>
            {tokens.value.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                    {t('wallet_no_collectables', { name: 'CTOM' })}
                </Typography>
            ) : (
                <div className={classes.root}>
                    <div className={classes.content}>
                        {tokens.value.map((token) => (
                            <section className={classes.tile} key={token.tokenId}>
                                <TokenCard token={token} canViewOnEtherscan />
                            </section>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}
function COTM_TOKEN_ADDRESS(COTM_TOKEN_ADDRESS: string) {
    throw new Error('Function not implemented.')
}
