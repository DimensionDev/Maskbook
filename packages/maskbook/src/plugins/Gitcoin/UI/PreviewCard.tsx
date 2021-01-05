import {
    makeStyles,
    createStyles,
    Card,
    Typography,
    Button,
    ButtonGroup,
    Grid,
    Avatar,
    Icon,
    SvgIconProps,
    SvgIcon,
} from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useGrant } from '../hooks/useGrant'
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder'
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
        },
        logo: {
            padding: theme.spacing(2),
            textAlign: 'center',
            '& > *': {
                width: 100,
                height: 100,
            },
        },
        title: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& > :last-child': {
                marginTop: 4,
                marginLeft: 4,
            },
        },
        description: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        update: {
            fontSize: 10,
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& svg': {
                marginRight: theme.spacing(0.5),
            },
        },
        avatar: {
            alignItems: 'center',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(3),
            display: 'flex',
        },
        small: {
            width: theme.spacing(4),
            height: theme.spacing(4),
            margin: theme.spacing(0, 1),
        },
        buttons: {},
        verified: {
            borderRadius: 50,
        },
        text: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            '-webkit-line-clamp': '4',
            '-webkit-box-orient': 'vertical',
        },
    }),
)

interface PreviewCardProps {
    id: string
    onRequest(): void
}

export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const classes = useStyles()
    const { value: grant, error, loading } = useGrant(props.id)

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>ERROR</h1>
    if (!grant) return null

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <div className={classes.logo}>
                <img src={grant.logo_url} />
            </div>
            <div className={classes.title}>
                <Typography variant="h6" color="textPrimary">
                    {grant.title}
                </Typography>
                {grant.verified ? <VerifiedUserIcon fontSize="small" color="primary" /> : null}
            </div>
            <div className={classes.description}>
                <Typography variant="body2" color="textSecondary" className={classes.text}>
                    {grant.description}
                </Typography>
            </div>
            <div className={classes.update}>
                <QueryBuilderIcon fontSize="small" color="disabled" />
                <Typography variant="body2" color="textSecondary">
                    Last update: {grant.last_update_natural}
                </Typography>
            </div>
            <div className={classes.avatar}>
                <Typography variant="body2">By</Typography>
                <Avatar
                    alt={grant.admin_profile.handle}
                    src={grant.admin_profile.avatar_url}
                    className={classes.small}
                />
                <Typography variant="body2">{grant.admin_profile.handle}</Typography>
            </div>
            <Grid container className={classes.buttons} spacing={2}>
                <Grid item xs={6}>
                    <Button variant="outlined" fullWidth color="primary">
                        View on Gitcoin
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" fullWidth color="primary">
                        Donate
                    </Button>
                </Grid>
            </Grid>
        </Card>
    )
}
