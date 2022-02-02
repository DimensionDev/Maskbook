import { makeStyles } from '@masknet/theme'
import { ChainId } from '@masknet/web3-shared-evm'
import { Card, Typography, CardActions, Link } from '@mui/material'
import { useI18N } from '../../../utils'
import { useFetchApi } from '../hooks/useFetchApi'
import { MaskTextIcon } from '../../../resources/MaskIcon'

interface Props extends React.PropsWithChildren<{}> {
    link: string
    chainId: ChainId
}

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            width: '100%',
            padding: 0,
            background: theme.palette.divider,
        },
        footer: {
            marginTop: -1,
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
    }
})

function ShoyuCard(props: Props) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const { SHOYU_SUBGRAPH } = useShoyuConstants()
    const { value: nftData, error, loading } = useFetchApi(props.link, SHOYU_SUBGRAPH)
    return (
        <Card className={classes.root} elevation={0}>
            {loading ? (
                <Typography variant="h6" align="center">
                    Loading...
                </Typography>
            ) : error ? (
                <Typography sx={{ color: 'red' }} variant="h6" align="center">
                    Error: {error.message}
                </Typography>
            ) : typeof nftData === 'undefined' || nftData === null ? (
                <Typography sx={{ color: 'red' }} variant="h6" align="center">
                    {t('plugin_shoyu_error_metadata')}
                </Typography>
            ) : (
                <div>
                    <ShoyuContent
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
                                <MaskTextIcon sx={{ width: 40, height: 10 }} viewBox="0 0 80 20" />
                            </Link>
                        </Typography>
                    </CardActions>
                </div>
            )}
        </Card>
    )
}

export default ShoyuCard
