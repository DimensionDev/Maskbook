import { createStyles, makeStyles } from '@material-ui/core'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useERC721TokenDetailed } from '../../../web3/hooks/useERC721TokenDetailed'
import { ELECTION_2020_CONSTANTS } from '../constants'
import { useAllElectionTokensOfOwner } from '../hooks/useAllElectionTokensOfOwner'
import { ElectionCard } from './ElectionCard'
import { useEffect } from 'react'

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

export interface ElectionTokenAlbumProps {
    setCollectiblesLoading: (loading:boolean) => void
}

export function ElectionTokenAlbum(props: ElectionTokenAlbumProps) {
    const classes = useStyles(props)

    // fetch the NFT token
    const ELECTION_TOKEN_ADDRESS = useConstant(ELECTION_2020_CONSTANTS, 'ELECTION_TOKEN_ADDRESS')
    const { value: electionToken, loading:loadingTokenDetail } = useERC721TokenDetailed(ELECTION_TOKEN_ADDRESS)
    const tokens = useAllElectionTokensOfOwner(electionToken)

    const chainIdValid = useChainIdValid()

    useEffect(() => {
        props.setCollectiblesLoading(loadingTokenDetail || tokens.loading)
    }, [props, loadingTokenDetail, tokens.loading])

    if (!chainIdValid) return null
    if (!tokens.value.length) return null
    return (
        <div className={classes.root}>
            <div className={classes.content}>
                {tokens.value.map((token) => (
                    <section className={classes.tile} key={token.tokenId}>
                        <ElectionCard token={token} canViewOnEtherscan />
                    </section>
                ))}
            </div>
        </div>
    )
}
