import { fetchApi } from '../utils'
import { makeStyles } from '@masknet/theme'
import React, { useState, useEffect } from 'react'
import type { nftData } from '../types'
import type { ChainId } from '@masknet/web3-shared'
import { Card, Link, Typography, CardActions } from '@material-ui/core'
import { useI18N } from '../../../utils'
import FoudationContent from './FoudationContent'
import FoundationPlaceBid from './FoundationPlaceBid'
import FoudationHeader from './FoudationHeader'
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
    const [nftData, setNftData] = useState<nftData>()
    useEffect(() => {
        async function fetch() {
            const result = await fetchApi(props.link, props.chainId)
            if (result) {
                setNftData({ graph: result.graph, metadata: result.metadata, link: props.link, chainId: props.chainId })
            }
        }
        fetch()
    }, [fetch])
    if (nftData) {
        return (
            <Card className={classes.root} elevation={0}>
                <FoudationHeader nftData={nftData} />
                <FoudationContent nft={nftData.graph.data.nfts[0]} metadata={nftData.metadata} />
                <FoundationPlaceBid nftData={nftData} />
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
                            <MaskTextIcon classes={{ root: classes.maskbook }} viewBox="0 0 80 20" />
                        </Link>
                    </Typography>
                </CardActions>
            </Card>
        )
    }
    return <></>
}

export default FoudationCard
