import { Stack, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { ProfileTab } from '@masknet/injected-ui/ProfileTab'

export const meta = {
    title: 'ProfileTab',
    description:
        'The extra "Web3" tab button injected next to a profile\'s own tabs on Instagram (packages/injected-ui/src/ProfileTab.tsx — same component as on X/Twitter and Facebook). Instagram is the only one of the three that adds an icon.',
}

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'inline-flex',
        justifyContent: 'center',
        marginRight: 24,
    },
    button: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '12px 0',
        borderTop: '1px solid transparent',
        fontWeight: 600,
        color: theme.vars.palette.text.secondary,
    },
    selected: {
        borderTop: `1px solid ${theme.vars.palette.primary.main}`,
        color: theme.vars.palette.primary.main,
    },
    icon: {
        width: 16,
        height: 16,
    },
}))

export default function ProfileTabInstagramDemo() {
    const { classes } = useStyles()

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="body2" color="text.secondary">
                Other platform tabs (Posts, Reels, Tagged, …) would sit to the left of this one.
            </Typography>
            <ProfileTab
                title="Web3"
                icon={<Icons.Collectible className={classes.icon} />}
                classes={classes}
                reset={() => {}}
                clear={() => {}}
            />
        </Stack>
    )
}
