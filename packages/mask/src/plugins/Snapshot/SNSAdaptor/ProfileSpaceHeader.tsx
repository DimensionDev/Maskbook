import { formatCount, type DAOResult } from '@masknet/web3-shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import { useState, useRef } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Typography, Avatar, IconButton, Button, ThemeProvider, type Theme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { SpaceMenu } from './SpaceMenu.js'
import { resolveSnapshotSpacePageUrl } from './helpers.js'

interface ProfileSpaceHeaderProps {
    spaceList: Array<DAOResult<ChainId.Mainnet>>
    currentSpace: DAOResult<ChainId.Mainnet>
    setSpaceIndex: (x: number) => void
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

export function ProfileSpaceHeader(props: ProfileSpaceHeaderProps) {
    const { spaceList, currentSpace, setSpaceIndex, theme } = props
    const { t } = useI18N()
    const { classes } = useStyles()
    const [spaceMenuOpen, setSpaceMenuOpen] = useState(false)
    const spaceRef = useRef<HTMLDivElement>(null)

    return (
        <Box className={classes.root}>
            <section className={classes.main} ref={spaceRef}>
                <Avatar className={classes.avatar} src={currentSpace.avatar} alt={currentSpace.spaceId} />
                <div className={classes.spaceInfo}>
                    <div className={classes.currentSpace}>
                        <Typography component="span" className={classes.symbol}>
                            {currentSpace.spaceName}
                        </Typography>
                        <Icons.Verification size={16} />
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
                                        onSelect={(i) => {
                                            setSpaceIndex(i)
                                            setSpaceMenuOpen(false)
                                        }}
                                        containerRef={spaceRef}
                                        spaceMenuOpen={spaceMenuOpen}
                                        setSpaceMenuOpen={setSpaceMenuOpen}
                                    />
                                </ThemeProvider>
                            </>
                        )}
                    </div>
                    {currentSpace.followersCount ? (
                        <Typography component="span" className={classes.followersCount}>
                            {t('plugin_snapshot_space_info_followers_count', {
                                followersCount: formatCount(currentSpace.followersCount, 1),
                            })}
                        </Typography>
                    ) : null}
                </div>
            </section>
            <Button
                color="primary"
                className={classes.joinButton}
                size="medium"
                variant="roundedContained"
                onClick={() => window.open(resolveSnapshotSpacePageUrl(currentSpace.spaceId))}>
                {t('plugin_snapshot_space_join')}
            </Button>
        </Box>
    )
}
