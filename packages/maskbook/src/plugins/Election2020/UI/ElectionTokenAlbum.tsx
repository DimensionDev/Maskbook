import React from 'react'
import { createStyles, makeStyles } from '@material-ui/core'
import { useChainIdValid } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { useERC721Token } from '../../../web3/hooks/useERC721Token'
import { EthereumTokenType } from '../../../web3/types'
import { ELECTION_2020_CONSTANTS } from '../constants'
import { useAllElectionTokensOfOwner } from '../hooks/useAllElectionTokensOfOwner'
import { ElectionCard } from './ElectionCard'

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

export interface ElectionTokenAlbumProps {}

export function ElectionTokenAlbum(props: ElectionTokenAlbumProps) {
    const classes = useStyles(props)

    // fetch the NFT token
    const ELECTION_TOKEN_ADDRESS = useConstant(ELECTION_2020_CONSTANTS, 'ELECTION_TOKEN_ADDRESS')
    const { value: electionToken } = useERC721Token({
        type: EthereumTokenType.ERC721,
        address: ELECTION_TOKEN_ADDRESS,
    })
    const tokens = useAllElectionTokensOfOwner(electionToken)

    const chainIdValid = useChainIdValid()
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
