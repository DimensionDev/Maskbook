import { Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ProfileTab } from '@masknet/injected-ui/ProfileTab'

export const meta = {
    title: 'ProfileTab',
    description:
        'The extra "Web3" tab button injected next to a profile page\'s own tabs on Facebook (packages/injected-ui/src/ProfileTab.tsx — same component as on X/Twitter and Instagram).',
}

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 80,
        padding: '4px 0',
    },
    button: {
        cursor: 'pointer',
        padding: '8px 0',
        fontWeight: 600,
        color: theme.vars.palette.text.secondary,
    },
    selected: {
        color: theme.vars.palette.primary.main,
    },
}))

export default function ProfileTabFacebookDemo() {
    const { classes } = useStyles()

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="body2" color="text.secondary">
                Other platform tabs (Posts, About, Friends, …) would sit to the left of this one.
            </Typography>
            <ProfileTab title="Web3" classes={classes} reset={() => {}} clear={() => {}} />
        </Stack>
    )
}
