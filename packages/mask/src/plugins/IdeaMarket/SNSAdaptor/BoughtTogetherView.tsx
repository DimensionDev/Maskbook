import { makeStyles } from '@masknet/theme'
import { Card, CardHeader, CardActions, Button, Grid, Typography, Paper, Link } from '@mui/material'
import { useI18N } from '../../../utils/i18n-next-ui'
import LoadingButton from '@mui/lab/LoadingButton'
import { useMutualHoldersTokens } from '../hooks/useMutualHoldersTokens'
import type { IdeaToken } from '../types'
import { useState } from 'react'
import { LoadingAnimation } from '@masknet/shared'
import { IdeaMarketIcon } from '../icons/IdeaMarketIcon'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(6),
    },
    paper: {
        marginBottom: theme.spacing(5),
    },
    header: {
        padding: theme.spacing(4),
    },
    details: {
        marginRight: theme.spacing(5),
        marginTop: theme.spacing(1),
    },
    title: {
        fontSize: 10,
    },
    value: {
        fontSize: 12,
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0),
        borderRight: `1px solid ${theme.palette.divider}`,
        '&:last-child': {
            border: 0,
        },
    },
    mutualData: {
        borderTop: `1px solid ${theme.palette.divider}`,
    },
    mutualHolders: {
        borderRight: `1px solid ${theme.palette.divider}`,
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme.spacing(8, 0),
    },
    message: {
        textAlign: 'center',
    },
    icon: {
        width: 35,
    },
}))

export function BoughtTogetherView({
    setTabIndex,
    ideaToken,
}: {
    setTabIndex: React.Dispatch<React.SetStateAction<number>>
    ideaToken: IdeaToken
}) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [loadingMore, setLoadingMore] = useState(false)
    const [pagination, setPagination] = useState(5)

    const { value: mutualIdeaTokens, error, loading, retry } = useMutualHoldersTokens(ideaToken.tokenId, pagination)

    if (loading && !mutualIdeaTokens) {
        return (
            <div className={classes.empty}>
                <LoadingAnimation />
            </div>
        )
    }

    if (error) {
        return (
            <Typography className={classes.message} color="textPrimary">
                {t('plugin_ideamarket_smthg_wrong')}
            </Typography>
        )
    }

    function handleClick() {
        setLoadingMore(true)
        setPagination((prevState) => prevState + 5)
        retry()
        setLoadingMore(false)
    }

    return (
        <div className={classes.root}>
            {mutualIdeaTokens?.map((token, i) => (
                <Paper key={i} elevation={3} className={classes.paper}>
                    <Card>
                        <CardHeader
                            avatar={<IdeaMarketIcon className={classes.icon} />}
                            action={
                                <Link underline="none" target="_blank" rel="noopener noreferrer">
                                    <Button className={classes.details} size="small" variant="outlined">
                                        {t('plugin_ideamarket_details')}
                                    </Button>
                                </Link>
                            }
                            title={token.name}
                            subheader={`RANK ${token.rank} - ${token.price}`}
                            className={classes.header}
                        />
                        <CardActions className={classes.mutualData}>
                            <Grid container className={classes.meta} direction="column">
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textPrimary" className={classes.value}>
                                        {token.mutualHolders}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary" className={classes.title}>
                                        {t('plugin_ideamarket_mutual_holders')}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Grid container className={classes.meta} direction="column">
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textPrimary" className={classes.value}>
                                        {token.mutualQuantity}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="body2" color="textSecondary" className={classes.title}>
                                        {t('plugin_ideamarket_mutual_tokens')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardActions>
                    </Card>
                </Paper>
            ))}
            <Grid container direction="row" justifyContent="center">
                <LoadingButton
                    onClick={handleClick}
                    loading={loadingMore}
                    loadingIndicator="Loading..."
                    variant="outlined">
                    More
                </LoadingButton>
            </Grid>
        </div>
    )
}
