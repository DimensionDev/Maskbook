import { CardContent, Tabs, Tab, Paper, DialogContent, Button, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useI18N } from '../../../utils'
import type { Nft, Metadata } from '../types'
import { makeStyles } from '@masknet/theme'
import type { ChainId } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'

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
            background: 'none',
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
            background: 'none',
        },
        tab: {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            height: 'var(--tabHeight)',
            minHeight: 'unset',
            minWidth: 'unset',
            whiteSpace: 'nowrap',
            '&:first-child': {
                borderRadius: theme.spacing(0.5, 0, 0, 0.5),
            },
            '&:last-child': {
                borderRadius: theme.spacing(0, 0.5, 0.5, 0),
            },
        },
        indicator: {
            color: 'white',
            height: '10%',
            borderRadius: theme.spacing(0.5),
        },
        name: {
            color: theme.palette.text.primary,
            margin: theme.spacing(1, 0, 1),
        },
        button: {
            color: theme.palette.background.paper,
            background: theme.palette.text.primary,
            margin: theme.spacing(2, 0, 0, 0),
            '&:hover': {
                background: theme.palette.action.active,
            },
        },
    }
})

function ShoyuContent(props: Props) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [open, setOpen] = useState<boolean>(false)
    const [tabIndex, setTabIndex] = useState<number>(0)
    const dateEnding = props.nft.mostRecentAuction.dateEnding
    const isOver = () => {
        if (dateEnding !== null && Math.floor(Date.now() / 1000) > Number(dateEnding)) {
            return false
        }
        return true
    }
    const tabs = [
        <Tab className={classes.tab} key="nft" label={t('plugin_shoyu_nft')} />,
        // <Tab className={classes.tab} key="create" label={t('plugin_shoyu_create')} />,
        <Tab className={classes.tab} key="details" label={t('plugin_shoyu_details')} />,
        <Tab className={classes.tab} key="activity" label={t('plugin_shoyu_activity')} />,
        <Tab className={classes.tab} key="Provenances" label={t('plugin_shoyu_provenances')} />,
        <Tab className={classes.tab} key="charity" label={t('plugin_shoyu_charity')} />,
        <Tab className={classes.tab} key="metaverse" label={t('plugin_shoyu_metaverse')} />,
    ]
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
                {tabIndex === 0 ? <ShoyuImage nftContract={props.nft.nftContract} metadata={props.metadata} /> : null}
                {tabIndex === 1 ? <ShoyuDetails nft={props.nft} metadata={props.metadata} /> : null}
                {tabIndex === 2 ? <ShoyuProvenances histories={props.nft.nftHistory} /> : null}
                {tabIndex === 3 ? <ShoyuActivity histories={props.nft.nftActivity} /> : null}
            </Paper>
            <Typography variant="h6" className={classes.name} align="left">
                {props.metadata?.name}
            </Typography>
            <ShoyuPrices nft={props.nft} metadata={props.metadata} />
            {isOver() && (
                <Button
                    className={classes.button}
                    onClick={() => setOpen(true)}
                    variant="contained"
                    fullWidth
                    size="large">
                    {t('plugin_shoyu_make_offer')}
                </Button>
            )}
            <InjectedDialog title={t('plugin_shoyu_make_an_offer')} open={open} onClose={() => setOpen(false)}>
                <DialogContent>
                    <ShoyuPlaceBid
                        chainId={props.chainId}
                        nft={props.nft}
                        metadata={props.metadata}
                        link={props.link}
                    />
                </DialogContent>
            </InjectedDialog>
        </CardContent>
    )
}

export default ShoyuContent
