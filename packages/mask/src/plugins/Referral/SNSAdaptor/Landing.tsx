import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography, Button, Grid, Box } from '@mui/material'

import { useI18N, Translate } from '../locales'
import { PageInterface, PagesType } from '../types'

import { IconURLs } from '../assets'

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        padding: theme.spacing(3, 0, 3),
        fontSize: '16px',
    },
    heading: {
        background: theme.palette.background.default,
        height: '174px',
        padding: theme.spacing(3, 4, 3),
        borderRadius: '8px',
        marginBottom: '24px',
    },
    walletStatusBox: {
        width: 535,
        margin: '24px auto',
    },
    img: {
        height: 60,
        width: 60,
        justifyContent: 'center',
        display: 'flex',
        marginBottom: '16px',
    },
    smallText: {
        fontSize: '15px',
    },
    icon: {
        width: '36px',
        height: '36px',
        marginRight: '12px',
    },
    dataItem: {
        '& b': {
            fontWeight: 600,
        },
    },
}))

export function Landing(props: PageInterface) {
    const t = useI18N()
    const { classes } = useStyles()

    const onClickContinue = useCallback(async () => {
        props.continue(PagesType.LANDING, PagesType.REFERRAL_FARMS)
    }, [props])

    const data = [
        {
            name: t.refer_to_farm(),
            desc: t.refer_to_farm_desc(),
            iconUrl: IconURLs.referToFarm,
        },
        {
            name: t.buy_to_farm(),
            desc: t.buy_to_farm_desc(),
            iconUrl: IconURLs.buyToFarm,
        },
        {
            name: t.create_farms(),
            desc: t.create_farms_desc(),
            iconUrl: IconURLs.createFarm,
        },
        {
            desc: (
                <Translate.create_farms_rewards_desc
                    components={{
                        strong: <strong>{t.rewards()}</strong>,
                    }}
                />
            ),
            iconUrl: IconURLs.rewards,
        },
    ]

    return (
        <div className={classes.wrapper}>
            <Grid container className={classes.heading} display="flex" justifyContent="center">
                <Grid item xs={12} display="flex" justifyContent="center">
                    <img src={IconURLs.referral} />
                </Grid>
                <Typography variant="h6" textAlign="center" fontWeight={400}>
                    <b>{t.referral_farming()}</b>
                    {t.referral_farms_short_desc()}
                </Typography>
            </Grid>
            <Typography fontWeight={600} variant="h6" marginBottom="16px">
                {t.how_it_works()}
            </Typography>
            <Grid container direction="row" className={classes.smallText} rowSpacing="12px" textAlign="left">
                {data.map((e, i) => {
                    return (
                        <Grid
                            key={i}
                            item
                            xs={12}
                            display="flex"
                            alignContent="center"
                            justifyItems="flex-start"
                            className={classes.dataItem}>
                            <Box className={classes.icon}>
                                <img src={e.iconUrl} alt={e.name} />
                            </Box>
                            <Typography>
                                <b>{e.name}</b> {e.name && '-'} {e.desc}
                            </Typography>
                        </Grid>
                    )
                })}
                <Grid item xs={12} textAlign="right">
                    <Button onClick={onClickContinue} variant="contained">
                        {t.continue()}
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}
