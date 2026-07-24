import { Icons } from '@masknet/icons'
import { Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/system'
import { Trans } from '@lingui/react/macro'

const useStyles = makeStyles()((theme) => {
    return {
        cardIcon: {
            filter: 'drop-shadow(0px 6px 12px rgba(0, 65, 185, 0.2))',
            marginLeft: theme.spacing(0.25),
        },
    }
})
interface PluginHeaderProps extends React.PropsWithChildren {
    isProfilePage?: boolean
    isTokenTagPopper?: boolean
}

export function PluginDescriptor({ children, isProfilePage, isTokenTagPopper }: PluginHeaderProps) {
    const { classes } = useStyles()

    return (
        <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', gap: 0.5, alignItems: 'center' }}>
                {isTokenTagPopper ?
                    <Icons.Web3ProfileCard className={classes.cardIcon} size={24} />
                : isProfilePage ?
                    <Icons.Web3Profile className={classes.cardIcon} size={24} />
                :   <Icons.DecentralizedSearch />}
                <Typography
                    sx={{
                        fontWeight: 'bolder',
                        fontSize: 16,
                        color: (theme) =>
                            isTokenTagPopper ? theme.vars.palette.maskColor.main : theme.vars.palette.maskColor.dark,
                    }}>
                    {isTokenTagPopper ?
                        <Trans>Web3 Profile Card</Trans>
                    : isProfilePage ?
                        <Trans>Web3 Profile</Trans>
                    :   <Trans>DSearch</Trans>}
                </Typography>
            </Stack>
            <Box>{children}</Box>
        </Stack>
    )
}
