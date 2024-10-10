import { makeStyles } from '@masknet/theme'
import { memo, useCallback } from 'react'
import { Box, Avatar, Typography, Link } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useNavigate } from 'react-router-dom'
import { type ProfileIdentifier, formatPersonaFingerprint } from '@masknet/shared-base'
import { useTheme } from '@mui/system'
import { CopyButton, EmptyStatus } from '@masknet/shared'
import { ConnectedAccounts } from './ConnectAccounts/index.js'
import type { Profile } from '../common.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        maxHeight: '100vh',
        height: '100%',
        overflowY: 'hidden',
    },
    header: {
        padding: theme.spacing(2),
        lineHeight: 0,
        display: 'grid',
        gridTemplateColumns: '24px auto 24px',
        alignItems: 'center',
        flexShrink: 0,
    },
    profileInfo: {
        width: '100%',
        background: theme.palette.maskColor.modalTitleBg,
    },
    back: {
        fontSize: 24,
        cursor: 'pointer',
        color: theme.palette.maskColor.main,
        border: 'none',
        background: 'none',
        padding: 0,
        margin: 0,
        outline: 'none',
    },
    info: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
    },
    icon: {
        width: 12,
        height: 12,
        fontSize: 12,
        color: theme.palette.maskColor.second,
    },
    empty: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 12,
        color: theme.palette.maskColor.second,
        whiteSpace: 'nowrap',
    },
    emptyContainer: {
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
    },
}))

interface FriendsDetailUIProps {
    avatar?: string
    profiles: Profile[]
    nextId: string
    publicKey?: string
    isLocal?: boolean
    onDelete: () => void
    deleting?: boolean
    localProfile?: ProfileIdentifier
}

export const FriendsDetailUI = memo<FriendsDetailUIProps>(function FriendsDetailUI({
    avatar,
    nextId,
    publicKey,
    profiles,
    isLocal,
    onDelete,
    deleting,
    localProfile,
}) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const handleBack = useCallback(() => navigate(-1), [])
    const theme = useTheme()
    return (
        <Box display="flex" flexDirection="column" alignItems="center" width="100%" className={classes.container}>
            <Box className={classes.profileInfo}>
                <Box className={classes.header}>
                    <button onClick={handleBack} type="submit" className={classes.back}>
                        <Icons.Comeback />
                    </button>
                    <Box />
                    {isLocal ?
                        <button onClick={onDelete} type="submit" className={classes.back} disabled={deleting}>
                            <Icons.Delete />
                        </button>
                    :   null}
                </Box>
                <Box className={classes.info}>
                    <Box>
                        {avatar ?
                            <Avatar src={avatar} style={{ width: 60, height: 60 }} />
                        :   <Icons.NextIdAvatar size={60} style={{ borderRadius: 99 }} />}
                    </Box>
                    <Typography fontSize={18} fontWeight="700" lineHeight="22px" marginTop="8px">
                        {publicKey ? formatPersonaFingerprint(publicKey) : null}
                    </Typography>
                    <Typography
                        fontSize={12}
                        color={theme.palette.maskColor.second}
                        lineHeight="16px"
                        display="flex"
                        alignItems="center"
                        columnGap="2px">
                        {formatPersonaFingerprint(nextId, 4)}
                        <CopyButton text={nextId} size={12} className={classes.icon} />
                        <Link
                            underline="none"
                            target="_blank"
                            rel="noopener noreferrer"
                            href={`https://web3.bio/${nextId}`}
                            className={classes.icon}>
                            <Icons.LinkOut size={12} />
                        </Link>
                    </Typography>
                </Box>
            </Box>
            {profiles.length ?
                <ConnectedAccounts profiles={profiles} localProfile={localProfile} avatar={avatar} />
            :   <div className={classes.emptyContainer}>
                    <EmptyStatus className={classes.empty}>
                        <Trans>No associated accounts</Trans>
                    </EmptyStatus>
                </div>
            }
        </Box>
    )
})
