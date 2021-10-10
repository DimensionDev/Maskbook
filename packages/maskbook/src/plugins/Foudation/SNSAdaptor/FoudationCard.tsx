import { fetchApi } from '../utils'
import { makeStyles } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared'
import { Card, Link, Typography, CardActions } from '@material-ui/core'
import { useI18N } from '../../../utils'
import FoudationContent from './FoudationContent'
import FoundationPlaceBid from './FoundationPlaceBid'
import FoudationHeader from './FoudationHeader'
import { useAsync } from 'react-use'

interface Props extends React.PropsWithChildren<{}> {
    link: string
    chainId: ChainId
}

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            border: `solid 1px ${theme.palette.divider}`,
            padding: 0,
        },
        PlaceInput: {
            maxWidth: '100%',
        },
        footer: {
            marginTop: -1, // merge duplicate borders
            zIndex: 1,
            position: 'relative',
            borderTop: `solid 1px ${theme.palette.divider}`,
            justifyContent: 'space-between',
        },
        subtitle: {
            fontSize: 12,
            marginRight: theme.spacing(0.5),
            maxHeight: '3.5rem',
            overflow: 'hidden',
            wordBreak: 'break-word',
        },
        error: {
            color: 'red',
        },
        footnote: {
            fontSize: 10,
            marginRight: theme.spacing(1),
        },
        footLink: {
            cursor: 'pointer',
            marginRight: theme.spacing(0.5),
            '&:last-child': {
                marginRight: 0,
            },
        },
        maskbook: {
            width: 40,
            height: 10,
        },
    }
})

function FoudationCard(props: Props) {
    const { classes } = useStyles()
    const { t } = useI18N()
    // const { SUBGRAPHS } = useFoundationConstants()
    const nftData = useAsync(async () => {
        // const result = await fetchApi(props.link, 'SUBGRAPHS')
        const result = await fetchApi(props.link, props.chainId)
        return result
    }, [props.link, props.chainId])
    return (
        <Card className={classes.root} elevation={0}>
            {nftData.loading ? (
                <Typography variant="h6" align="center">
                    Loading...
                </Typography>
            ) : nftData.error ? (
                <Typography className={classes.error} variant="h6" align="center">
                    Error: {nftData.error.message}
                </Typography>
            ) : typeof nftData.value === 'undefined' ? (
                <Typography className={classes.error} variant="h6" align="center">
                    {t('plugin_foundation_error_metadata')}
                </Typography>
            ) : (
                <div>
                    <FoudationHeader
                        nft={nftData.value?.graph.data.nfts}
                        metadata={nftData.value?.metadata}
                        link={props.link}
                    />
                    <FoudationContent nft={nftData.value?.graph.data.nfts[0]} metadata={nftData.value?.metadata} />
                    <FoundationPlaceBid
                        chainId={props.chainId}
                        nft={nftData.value?.graph.data.nfts[0]}
                        metadata={nftData.value?.metadata}
                    />
                    <CardActions className={classes.footer}>
                        <Typography className={classes.footnote} variant="subtitle2">
                            <span>{t('plugin_powered_by')} </span>
                            <Link
                                className={classes.footLink}
                                color="textSecondary"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Mask"
                                href="https://mask.io"
                            />
                        </Typography>
                    </CardActions>
                </div>
            )}
        </Card>
    )
}

export default FoudationCard
