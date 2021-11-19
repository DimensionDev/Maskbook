import { CardContent, Tabs, Tab, Paper } from '@mui/material'
import React, { useState } from 'react'
import { useI18N } from '../../../utils'
import type { Nft, Metadata } from '../types'
import { makeStyles } from '@masknet/theme'
import FoundationProvenances from './FoundationProvenances'
import FoundationImage from './FoundationImage'
import FoundationDescription from './FoundationDescription'
import FoundationPlaceBid from './FoundationPlaceBid'
import type { ChainId } from '@masknet/web3-shared-evm'
import FoundationHeader from './FoundationHeader'

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
            borderRadius: '4px',
            background: 'palette.background.paper',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        tabs: {
            height: 'var(--tabHeight)',
            width: '100%',
            minHeight: 'unset',
            margin: theme.spacing(1, 0, 2, 0),
        },
        tab: {
            background: theme.palette.background.paper,
            height: 'var(--tabHeight)',
            minHeight: 'unset',
            minWidth: 'unset',
            whiteSpace: 'nowrap',
            color: 'white',
            '&:first-child': {
                borderRadius: '4px 0px 0px 4px',
            },
            '&:last-child': {
                borderRadius: '0px 4px 4px 0px',
            },
        },
        indicator: {
            color: 'white',
            height: '10%',
            borderRadius: '4px 4px 4px 4px',
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
    console.log('reload1')
    return (
        <CardContent>
            <Tabs
                className={classes.tabs}
                indicatorColor="primary"
                classes={{ indicator: classes.indicator }}
                variant="fullWidth"
                value={tabIndex}
                onChange={(ev: React.ChangeEvent<{}>, newValue: number) => {
                    setTabIndex(newValue)
                }}>
                {tabs}
            </Tabs>
            <Paper className={classes.body}>
                {tabIndex === 0 ? (
                    <FoundationImage nftContract={props.nft.nftContract} metadata={props.metadata} />
                ) : null}
                {tabIndex === 1 ? <FoundationDescription /> : null}
                {tabIndex === 2 ? <FoundationProvenances histories={props.nft.nftHistory} /> : null}
            </Paper>
            <FoundationHeader nft={props.nft} metadata={props.metadata} link={props.link} />
            <FoundationPlaceBid chainId={props.chainId} nft={props.nft} metadata={props.metadata} link={props.link} />
        </CardContent>
    )
}

export default FoundationContent
