import { useCallback } from 'react'
import { makeStyles, createStyles, Card, Typography, Button,  Grid, Avatar } from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useGrant } from '../hooks/useGrant'
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginGitcoinMessages } from '../messages'

const useStyles = makeStyles((theme) => createStyles({
    root: {
        padding: theme.spacing(1),
    },
    logo: {
        padding: theme.spacing(4),
        textAlign: 'center',
        "& > *": {
            width: 100,
            height: 100,
        },
    },
    title: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    description: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    update: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        display: 'flex',
        flexDirection: 'row',
        "& > * ": {
            marginLeft: theme.spacing(1),
        },
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
      },
    buttons: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        "& > *": {
            justifyContent: 'center',
            textAlign: 'center',
            "& > *": {
                width: 150,
            },
        },

    },
    verified: {
        borderRadius: 50,
    },
    text: {
        overflow : 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        '-webkit-line-clamp': '4',
        '-webkit-box-orient': 'vertical',
    },
}))

interface PreviewCardProps {
    id: string
    onRequest(): void
}

export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { value: grant, error, loading } = useGrant(props.id)

    //#region the donation dialog
    const [_, openDonationDialog] = useRemoteControlledDialog(PluginGitcoinMessages.events.donationDialogUpdated)
    const onDonate = useCallback(() => {
        if (!grant) return
        openDonationDialog({
            open: true,
            address: grant.admin_address,
            title: grant.title,
        })
    }, [grant, openDonationDialog])
    //#endregion

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>ERROR</h1>
    if (!grant) return null

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <div className={classes.logo}>
                <img src={grant.logo_url} />
            </div>

            <div className={classes.title}>
                <Typography variant='h6' color='textPrimary'>
                    {grant.title}
                </Typography>
                {/*
                <Icon color="primary" fontSize="small">check_circle</Icon>
                */}
                {grant.verified ? (<CheckIcon fontSize="small" color='secondary' />): null}
            </div>
            <div className={classes.description}>
                <Typography variant='body1' color='textSecondary' className={classes.text}>
                    {grant.description}
                </Typography>
            </div>
            <div className={classes.update}>
                <QueryBuilderIcon fontSize='small' color='disabled' />
                <Typography variant='body1' color='textSecondary'>
                   Last update: {grant.last_update_natural}
                </Typography>
            </div>

            <div className={classes.avatar}>
                <Typography variant='body2'>
                    By
                </Typography>
                <Avatar alt={grant.admin_profile.handle} src={grant.admin_profile.avatar_url} className={classes.small}/>
                <Typography variant='body2'>
                    {grant.admin_profile.handle}
                </Typography>
            </div>


            <Grid container className={classes.buttons} spacing={2}>
                <Grid item xs={6} >
                    <Button variant="outlined" color="primary">View on Gitcoin</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" color="primary">Donate</Button>
                </Grid>
            </Grid>

        </Card>
    )
}
