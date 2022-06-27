import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography, Button, Grid, Box } from '@mui/material'

import { useI18N, Translate } from '../locales'
import { PageInterface, PagesType } from '../types'

import { ReferralFarmsIcon, ReferToFarmIcon, CreateFarmIcon, BuyToFarmIcon, RewardsIcon } from './shared-ui/icons'

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
            icon: <ReferToFarmIcon />,
        },
        {
            name: t.buy_to_farm(),
            desc: t.buy_to_farm_desc(),
            icon: <BuyToFarmIcon />,
        },
        {
            name: t.create_farms(),
            desc: t.create_farms_desc(),
            icon: <CreateFarmIcon />,
        },
        {
            desc: (
                <Translate.create_farms_rewards_desc
                    components={{
                        strong: <strong>{t.rewards()}</strong>,
                    }}
                />
            ),
            icon: <RewardsIcon />,
        },
    ]

    return (
        <div className={classes.wrapper}>
            <Grid container className={classes.heading} display="flex" justifyContent="center">
                <Grid item xs={12} display="flex" justifyContent="center">
                    <ReferralFarmsIcon />
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
                            <Box className={classes.icon}>{e.icon}</Box>
                            <Typography>
                                <b>{e.name}</b> {e.name && '-'} {e.desc}
                            </Typography>
                        </Grid>
                    )
                })}
                <Grid item xs={12} textAlign="right">
                    <Button onClick={onClickContinue}>{t.continue()}</Button>
                </Grid>
            </Grid>
        </div>
    )
}
