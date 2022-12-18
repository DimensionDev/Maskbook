import { Icons } from '@masknet/icons'
import { Stack, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useSharedI18N } from '@masknet/shared'
import { Box } from '@mui/system'

const useStyles = makeStyles()((theme) => {
    return {
        cardIcon: {
            filter: 'drop-shadow(0px 6px 12px rgba(0, 65, 185, 0.2))',
            marginLeft: theme.spacing(0.25),
        },
    }
})
interface PluginHeaderProps extends React.PropsWithChildren<{}> {
    isNFTProjectPopper?: boolean
    isProfilePage?: boolean
    isPopper?: boolean
}

export const PluginDescriptor = ({ children, isNFTProjectPopper, isProfilePage, isPopper }: PluginHeaderProps) => {
    const theme = useTheme()
    const { classes } = useStyles()
    const t = useSharedI18N()

    return (
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
            <Stack flexDirection="row" justifyContent="space-between" gap={0.5} alignItems="center">
                {isNFTProjectPopper ? (
                    <Icons.Web3ProfileCard className={classes.cardIcon} size={24} />
                ) : isProfilePage ? (
                    <Icons.Web3Profile className={classes.cardIcon} size={24} />
                ) : (
                    <Icons.DecentralizedSearch />
                )}
                <Typography
                    color={isNFTProjectPopper || isPopper ? undefined : theme.palette.maskColor.dark}
                    fontWeight="bolder"
                    fontSize={16}>
                    {isNFTProjectPopper
                        ? t.avatar_profile_card_name()
                        : isProfilePage
                        ? t.profile_card_name()
                        : t.decentralized_search_name()}
                </Typography>
            </Stack>
            <Box>{children}</Box>
        </Stack>
    )
}
