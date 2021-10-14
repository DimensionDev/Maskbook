import { makeStyles } from '@masknet/theme'
import { ChainId, useFoundationConstants } from '@masknet/web3-shared'
import { Card, Typography, CardActions, Link } from '@material-ui/core'
import { useI18N } from '../../../utils'
import { useFetchApi } from '../hooks/useFetchApi'
import FoundationHeader from './FoundationHeader'
import FoundationContent from './FoundationContent'
import { MaskTextIcon } from '../../../resources/MaskIcon'

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
        footMenu: {
            color: theme.palette.text.secondary,
            fontSize: 10,
            display: 'flex',
            alignItems: 'center',
        },
        footName: {
            marginLeft: theme.spacing(0.5),
        },
        mask: {
            width: 40,
            height: 10,
        },
    }
})

function FoundationCard(props: Props) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { SUBGRAPHS } = useFoundationConstants()
    const { value: nftData, error, loading } = useFetchApi(props.link, SUBGRAPHS)
    return (
        <Card className={classes.root} elevation={0}>
            {loading ? (
                <Typography variant="h6" align="center">
                    Loading...
                </Typography>
            ) : error ? (
                <Typography className={classes.error} variant="h6" align="center">
                    Error: {error.message}
                </Typography>
            ) : typeof nftData === 'undefined' || nftData === null ? (
                <Typography className={classes.error} variant="h6" align="center">
                    {t('plugin_foundation_error_metadata')}
                </Typography>
            ) : (
                <div>
                    <FoundationHeader
                        nft={nftData.subgraphResponse.data.nfts[0]}
                        metadata={nftData.metadataResponse}
                        link={props.link}
                    />
                    <FoundationContent
                        nft={nftData.subgraphResponse.data.nfts[0]}
                        metadata={nftData.metadataResponse}
                        chainId={props.chainId}
                        link={props.link}
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
                                href="https://mask.io">
                                <MaskTextIcon classes={{ root: classes.mask }} viewBox="0 0 80 20" />
                            </Link>
                        </Typography>
                    </CardActions>
                </div>
            )}
        </Card>
    )
}

export default FoundationCard
