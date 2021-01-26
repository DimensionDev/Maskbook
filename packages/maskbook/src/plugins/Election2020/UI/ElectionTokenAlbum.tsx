import { createStyles, makeStyles, Typography } from '@material-ui/core'
import { useConstant } from '../../../web3/hooks/useConstant'
import { ELECTION_2020_CONSTANTS } from '../constants'
import { useAllElectionTokensOfOwner } from '../hooks/useAllElectionTokensOfOwner'
import { ElectionCard } from './ElectionCard'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useAsyncERC721TokenDetailed } from '../../../web3/suspends/getERC721TokenDetailed'

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
    setCollectiblesLoading?: (loading: boolean) => void
}

export function ElectionTokenAlbum(props: ElectionTokenAlbumProps) {
    const classes = useStyles(props)

    // fetch the NFT token
    const ELECTION_TOKEN_ADDRESS = useConstant(ELECTION_2020_CONSTANTS, 'ELECTION_TOKEN_ADDRESS')
    const electionToken = useAsyncERC721TokenDetailed(ELECTION_TOKEN_ADDRESS)
    const tokens = useAllElectionTokensOfOwner(electionToken!)

    const { t } = useI18N()
    return (
        <>
            {tokens.value.length === 0 ? (
                <Typography variant="body1" color="textSecondary">
                    {t('wallet_no_collectables', { name: 'Election' })}
                </Typography>
            ) : (
                <div className={classes.root}>
                    <div className={classes.content}>
                        {tokens.value.map((token) => (
                            <section className={classes.tile} key={token.tokenId}>
                                <ElectionCard token={token} canViewOnEtherscan />
                            </section>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}
