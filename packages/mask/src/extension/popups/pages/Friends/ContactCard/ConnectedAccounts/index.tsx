import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, Typography, useTheme, ButtonBase } from '@mui/material'
import { type BindingProof, PopupRoutes } from '@masknet/shared-base'
import { useNavigate } from 'react-router-dom'
import { AccountRender } from '../../AccountRender/index.js'

const useStyles = makeStyles()((theme) => ({
    connectedAccounts: {
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        background: theme.palette.maskColor.white,
        padding: '8px',
        position: 'relative',
    },
    more: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        background: 'rgba(28, 104, 243, 0.1)',
        borderRadius: '50%',
        position: 'absolute',
        right: '10px',
    },
}))

interface ConnectedAccountsProps {
    avatar?: string
    profiles: BindingProof[]
    nextId?: string
    publicKey?: string
    isLocal?: boolean
}

export const ConnectedAccounts = memo<ConnectedAccountsProps>(function ({
    avatar,
    nextId,
    profiles,
    publicKey,
    isLocal,
}) {
    const theme = useTheme()
    const { classes } = useStyles()
    const navigate = useNavigate()

    return (
        <Box
            display="flex"
            gap="8px"
            alignItems="center"
            height="58px"
            className={classes.connectedAccounts}
            width="100%">
            {profiles.slice(0, 2).map((profile, index) => {
                return <AccountRender key={index} profile={profile} />
            })}
            {profiles.length > 2 ? (
                <ButtonBase
                    className={classes.more}
                    onClick={() => {
                        navigate(`${PopupRoutes.FriendsDetail}/${nextId}`, {
                            state: {
                                avatar,
                                publicKey,
                                nextId,
                                profiles,
                                isLocal,
                            },
                        })
                    }}>
                    <Typography fontSize={12} fontWeight={400} lineHeight="16px" color={theme.palette.maskColor.main}>
                        {`+${profiles.length - 2}`}
                    </Typography>
                </ButtonBase>
            ) : null}
        </Box>
    )
})
