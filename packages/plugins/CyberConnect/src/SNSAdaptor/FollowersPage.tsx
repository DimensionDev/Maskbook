import { LoadingBase, MaskLightTheme, makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { ElementAnchor, LoadingStatus, ReloadStatus } from '@masknet/shared'
import { useI18N } from '../locales/index.js'
import { useFollowers } from '../hooks/useFollowers.js'
import type { ProfileTab } from '../constants.js'
import type { IFollowIdentity } from '../Worker/apis/index.js'
import { FollowRow } from './FollowTab.js'
import { useEffect } from 'react'
import { useIterator } from '@masknet/web3-hooks-base'
import { ThemeProvider } from '@emotion/react'

const useStyles = makeStyles()((theme) => ({
    root: {},
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
            <ThemeProvider theme={MaskLightTheme}>
                <ReloadStatus height={400} p={2} message={t.failed()} onRetry={retry} />
            </ThemeProvider>
        )
    }

    if (!value?.length && loading) return <LoadingStatus height={400} omitText />
    return (
        <Box className={classes.root}>
            {value?.length
                ? value.map((x: IFollowIdentity) => <FollowRow key={x.ens || x.address} identity={x} />)
                : props.hint}
            <ElementAnchor callback={() => next?.()}>{!done && value?.length ? <LoadingBase /> : null}</ElementAnchor>
        </Box>
    )
}
