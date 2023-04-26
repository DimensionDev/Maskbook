import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { ElementAnchor } from '@masknet/shared'
import { useI18N } from '../locales/index.js'
import { useFollowers } from '../hooks/useFollowers.js'
import type { ProfileTab } from '../constants.js'
import type { IFollowIdentity } from '../Worker/apis/index.js'
import { FollowRow } from './FollowTab.js'
import { useEffect } from 'react'
import { useIterator } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    root: {},
    statusBox: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 400,
        flexDirection: 'column',
    },
}))

interface FollowersPageProps {
    address?: string
    hint?: React.ReactNode
    tab: ProfileTab
}

export function FollowersPage(props: FollowersPageProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const iterator = useFollowers(props.tab, props.address)
    const { value, next, done, error, retry, loading } = useIterator<IFollowIdentity>(iterator)

    useEffect(() => {
        if (value?.length || loading) return
        if (next) next()
    }, [value?.length, loading, next])

    if (error) {
        return (
            <Box className={classes.statusBox} p={2}>
                <Typography
                    color={(theme) => theme.palette.maskColor.publicSecond}
                    marginBottom="14px"
                    fontSize="12px"
                    fontWeight={700}>
                    {t.failed()}
                </Typography>
                <Button variant="roundedContained" onClick={retry}>
                    {t.reload()}
                </Button>
            </Box>
        )
    }

    if (!value?.length && loading)
        return (
            <Box className={classes.statusBox}>
                <LoadingBase />
            </Box>
        )
    return (
        <Box className={classes.root}>
            {value?.length ? value.map((x: IFollowIdentity) => <FollowRow key={x.address} identity={x} />) : props.hint}
            <ElementAnchor callback={() => next?.()}>{!done && value?.length ? <LoadingBase /> : null}</ElementAnchor>
        </Box>
    )
}
