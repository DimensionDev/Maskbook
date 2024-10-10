import { Trans } from '@lingui/macro'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { formatCount, type DAOResult } from '@masknet/web3-shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { Avatar, Box, Button, IconButton, ThemeProvider, Typography, type Theme } from '@mui/material'
import { useRef, useState } from 'react'
import { SpaceMenu } from './SpaceMenu.js'
import { resolveSnapshotSpacePageUrl } from './helpers.js'
import { useCurrentAccountFollowSpaceList } from './hooks/useCurrentAccountFollowSpaceList.js'

interface ProfileSpaceHeaderProps {
    spaceList: Array<DAOResult<ChainId.Mainnet>>
    currentSpace: DAOResult<ChainId.Mainnet>
    setSpaceId(id: string): void
    theme: Theme
}

const useStyles = makeStyles()((theme) => ({
    root: {
        marginTop: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    main: {
        display: 'flex',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 999,
    },
    symbol: {
        fontWeight: 700,
        fontSize: 20,
        lineHeight: 1.2,
        color: theme.palette.maskColor.dark,
        display: 'flex',
        alignItems: 'center',
        marginRight: 5,
    },
    followersCount: {
        fontSize: 14,
        color: theme.palette.maskColor.secondaryDark,
    },
    spaceInfo: {
        marginLeft: 4,
    },
    currentSpace: {
        display: 'flex',
        alignItems: 'center',
    },
    arrowIcon: {
        color: theme.palette.maskColor.dark,
    },
    joinButton: {
        marginLeft: 'auto',
        width: 96,
        height: 32,
    },
}))

export function ProfileSpaceHeader({ spaceList, currentSpace, setSpaceId, theme }: ProfileSpaceHeaderProps) {
    const { classes } = useStyles()
    const [spaceMenuOpen, setSpaceMenuOpen] = useState(false)
    const spaceRef = useRef<HTMLDivElement>(null)
    const { account } = useChainContext()
    const { data: followedSpaceList } = useCurrentAccountFollowSpaceList()

    return (
        <Box className={classes.root}>
            <section className={classes.main} ref={spaceRef}>
                <Avatar className={classes.avatar} src={currentSpace.avatar} alt={currentSpace.spaceId} />
                <div className={classes.spaceInfo}>
                    <div className={classes.currentSpace}>
                        <Typography component="span" className={classes.symbol}>
                            {currentSpace.spaceName}
                        </Typography>
                        {currentSpace.isVerified ?
                            <Icons.Verification size={16} />
                        :   null}
                        {spaceList.length > 1 && (
                            <>
                                <IconButton
                                    sx={{ padding: 0 }}
                                    size="small"
                                    onClick={() => setSpaceMenuOpen((v) => !v)}>
                                    <Icons.ArrowDrop size={24} className={classes.arrowIcon} />
                                </IconButton>
                                <ThemeProvider theme={theme}>
                                    <SpaceMenu
                                        options={spaceList}
                                        currentOption={currentSpace}
                                        onSelect={(option) => {
                                            setSpaceId(option.spaceId)
                                            setSpaceMenuOpen(false)
                                        }}
                                        containerRef={spaceRef}
                                        open={spaceMenuOpen}
                                        onClose={() => setSpaceMenuOpen(false)}
                                    />
                                </ThemeProvider>
                            </>
                        )}
                    </div>
                    {currentSpace.followersCount ?
                        <Typography component="span" className={classes.followersCount}>
                            <Trans>{formatCount(currentSpace.followersCount, 1)} members</Trans>
                        </Typography>
                    :   null}
                </div>
            </section>
            <Button
                color="primary"
                className={classes.joinButton}
                size="medium"
                variant="roundedContained"
                onClick={() => window.open(resolveSnapshotSpacePageUrl(currentSpace.spaceId))}>
                {followedSpaceList?.includes(currentSpace.spaceId) && account ?
                    <Trans>View</Trans>
                :   <Trans>Join</Trans>}
            </Button>
        </Box>
    )
}
