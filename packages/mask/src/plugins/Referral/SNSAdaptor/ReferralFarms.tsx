import { useState } from 'react'
import { TabContext, TabPanel } from '@mui/lab'
import { makeStyles } from '@masknet/theme'
import { Button, Box, Tab, Tabs, Grid, Typography } from '@mui/material'

import { useI18N } from '../../../utils'
import { PageInterface, PagesType, TabsReferralFarms } from '../types'

import { IconURLs } from '../assets'
import { useTabStyles } from './styles'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '100%',
        borderRadius: 8,
    },
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    container: {
        flex: 1,
        height: '100%',
    },
    tab: {
        maxHeight: '100%',
        height: '100%',
        overflow: 'auto',
        padding: `${theme.spacing(3)} 0`,
    },
    tabs: {
        width: '288px',
    },
}))

const useStylesType = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100px',
        borderRadius: '8px',
        background: theme.palette.background.default,
    },
    img: {
        width: 40,
        marginRight: 4,
        justifyContent: 'center',
    },
    name: {
        fontSize: '0.938rem',
    },
}))

interface TypeProps {
    name: string
    onClick?: () => void
    iconUrl: string
}
export function Type({ name, onClick, iconUrl }: TypeProps) {
    const { classes } = useStylesType()
    return (
        <Grid item xs={4} key={name}>
            <Button
                variant="rounded"
                onClick={() => {
                    onClick?.()
                }}
                className={classes.root}>
                <Grid>
                    <img src={iconUrl} />
                    <Typography fontWeight={400} className={classes.name}>
                        {name}
                    </Typography>
                </Grid>
            </Button>
        </Grid>
    )
}

export function ReferralFarms(props: PageInterface) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { classes: tabClasses } = useTabStyles()

    const [tab, setTab] = useState<string>(TabsReferralFarms.TOKENS)

    const types = [
        {
            name: t('plugin_referral_refer_to_farm'),
            onClick: () => {
                props.continue(PagesType.REFERRAL_FARMS, PagesType.REFER_TO_FARM, tab + ': ' + PagesType.REFER_TO_FARM)
            },
            iconUrl: IconURLs.referToFarm,
        },
        {
            name: t('plugin_referral_buy_to_farm'),
            onClick: () => {
                props.continue(PagesType.REFERRAL_FARMS, PagesType.BUY_TO_FARM, tab + ': ' + PagesType.BUY_TO_FARM)
            },
            iconUrl: IconURLs.buyToFarm,
        },
        {
            name: t('plugin_referral_create_farms'),
            onClick: () => {
                props.continue(PagesType.REFERRAL_FARMS, PagesType.CREATE_FARM, tab + ': ' + PagesType.CREATE_FARM)
            },
            iconUrl: IconURLs.createFarm,
        },
    ]

    return (
        <div>
            <Box className={classes.container}>
                <TabContext value={String(tab)}>
                    <Tabs
                        value={tab}
                        centered
                        variant="fullWidth"
                        onChange={(e, v) => setTab(v)}
                        aria-label="persona-post-contacts-button-group">
                        <Tab value={TabsReferralFarms.TOKENS} label="Crypto Tokens" classes={tabClasses} />
                        <Tab value={TabsReferralFarms.NFT} label="NFTs" classes={tabClasses} disabled />
                    </Tabs>
                    <TabPanel value={TabsReferralFarms.TOKENS} className={classes.tab}>
                        <Grid container spacing="20px">
                            {types.map((type) => (
                                <Type key={type.name} name={type.name} onClick={type.onClick} iconUrl={type.iconUrl} />
                            ))}
                        </Grid>
                    </TabPanel>
                    <TabPanel value={TabsReferralFarms.NFT} className={classes.tab}>
                        <Grid container spacing="20px">
                            {types.map((type) => (
                                <Type key={type.name} name={type.name} onClick={type.onClick} iconUrl={type.iconUrl} />
                            ))}
                        </Grid>
                    </TabPanel>
                </TabContext>
            </Box>
        </div>
    )
}
