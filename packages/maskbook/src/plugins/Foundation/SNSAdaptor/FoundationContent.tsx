import { CardContent, Tabs, Tab, Paper } from '@material-ui/core'
import React, { useState } from 'react'
import { useI18N } from '../../../utils'
import type { Nft, Metadata } from '../types'
import { makeStyles } from '@masknet/theme'
import FoundationProvenances from './FoundationProvenances'
import FoundationImage from './FoundationImage'
import FoundationDescription from './FoundationDescription'
import FoundationPlaceBid from './FoundationPlaceBid'
import type { ChainId } from '@masknet/web3-shared'

interface Props extends React.PropsWithChildren<{}> {
    nft: Nft
    metadata: Metadata
    chainId: ChainId
    link: string
}

const useStyles = makeStyles()((theme) => {
    return {
        body: {
            flex: 1,
            borderRadius: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            height: 'var(--tabHeight)',
            width: '100%',
            minHeight: 'unset',
            borderTop: `solid 1px ${theme.palette.divider}`,
            borderBottom: `solid 1px ${theme.palette.divider}`,
            margin: theme.spacing(1, 0, 2, 0),
        },
        tab: {
            height: 'var(--tabHeight)',
            minHeight: 'unset',
            minWidth: 'unset',
            whiteSpace: 'nowrap',
        },
    }
})

function FoundationContent(props: Props) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const [tabIndex, setTabIndex] = useState<number>(0)
    const tabs = [
        <Tab className={classes.tab} key="metadata" label={t('plugin_foundation_metadata')} />,
        <Tab className={classes.tab} key="description" label={t('plugin_foundation_description')} />,
        <Tab className={classes.tab} key="provenance" label={t('plugin_foundation_provenace')} />,
    ]
    return (
        <CardContent>
            <Tabs
                className={classes.tabs}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                value={tabIndex}
                onChange={(ev: React.ChangeEvent<{}>, newValue: number) => {
                    setTabIndex(newValue)
                }}
                TabIndicatorProps={{
                    style: {
                        display: 'none',
                    },
                }}>
                {tabs}
            </Tabs>
            <Paper className={classes.body}>
                {tabIndex === 0 ? (
                    <FoundationImage nftContract={props.nft.nftContract} metadata={props.metadata} />
                ) : null}
                {tabIndex === 1 ? <FoundationDescription description={props.metadata.description} /> : null}
                {tabIndex === 2 ? <FoundationProvenances histories={props.nft.nftHistory} /> : null}
            </Paper>
            <FoundationPlaceBid chainId={props.chainId} nft={props.nft} metadata={props.metadata} link={props.link} />
        </CardContent>
    )
}

export default FoundationContent
