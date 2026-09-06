import { Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ProfileTab } from '@masknet/injected-ui/ProfileTab'

export const meta = {
    title: 'ProfileTab',
    description:
        'The extra "Web3" tab button injected next to a profile\'s own tabs — shared verbatim across X/Twitter, Facebook, and Instagram (packages/injected-ui/src/ProfileTab.tsx). Click it to switch.',
}

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'inline-block',
    },
    button: {
        cursor: 'pointer',
        padding: '12px 16px',
        fontWeight: 700,
        color: theme.vars.palette.text.secondary,
    },
    selected: {
        color: theme.vars.palette.primary.main,
        borderBottom: `2px solid ${theme.vars.palette.primary.main}`,
    },
}))

export default function ProfileTabTwitterDemo() {
    const { classes } = useStyles()

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="body2" color="text.secondary">
                Other platform tabs (Posts, Replies, …) would sit to the left of this one.
            </Typography>
            <ProfileTab title="Web3" classes={classes} reset={() => {}} clear={() => {}} />
        </Stack>
    )
}
