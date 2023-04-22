import { type DAOResult } from '@masknet/web3-shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import { useI18N } from '../../../utils/index.js'
import { useState, useRef } from 'react'
import { Icons } from '@masknet/icons'
import { Box, Typography, Avatar, IconButton, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { SpaceMenu } from './SpaceMenu.js'

interface ProfileSpaceHeaderProps {
    spaceList: Array<DAOResult<ChainId.Mainnet>>
}

const useStyles = makeStyles()((theme) => ({
    root: {
        marginTop: 16,
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
}))

export function ProfileSpaceHeader(props: ProfileSpaceHeaderProps) {
    const { spaceList } = props
    const { t } = useI18N()
    const theme = useTheme()
    const { classes } = useStyles()
    const [spaceIndex, setSpaceIndex] = useState(0)
    const [spaceMenuOpen, setSpaceMenuOpen] = useState(false)
    const currentSpace = spaceList[spaceIndex]
    const spaceRef = useRef<HTMLDivElement>(null)
    console.log({ currentSpace, spaceList })

    return (
        <Box className={classes.root}>
            <section className={classes.main} ref={spaceRef}>
                <Avatar className={classes.avatar} src={currentSpace.avatar} alt={currentSpace.spaceId} />
                <div className={classes.spaceInfo}>
                    <div className={classes.currentSpace}>
                        <Typography component="span" className={classes.symbol}>
                            {currentSpace.spaceName}
                        </Typography>
                        <Icons.Verification size={16} color={theme.palette.maskColor.success} />
                        {spaceList.length > 1 && (
                            <>
                                <IconButton
                                    sx={{ padding: 0 }}
                                    size="small"
                                    onClick={() => setSpaceMenuOpen((v) => !v)}>
                                    <Icons.ArrowDrop size={24} className={classes.arrowIcon} />
                                </IconButton>
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
                            </>
                        )}
                    </div>
                    <Typography component="span" className={classes.followersCount}>
                        {t('plugin_snapshot_space_info_followers_count', {
                            followersCount: currentSpace.followersCount,
                        })}
                    </Typography>
                </div>
            </section>
        </Box>
    )
}
