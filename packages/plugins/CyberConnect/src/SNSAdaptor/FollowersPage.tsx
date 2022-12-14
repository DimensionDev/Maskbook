import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { ElementAnchor, useIterator } from '@masknet/shared'
import { useFollowers } from '../hooks/useFollowers.js'
import type { ProfileTab } from '../constants.js'
import { useI18N } from '../locales/index.js'
import type { IFollowIdentity } from '../Worker/apis/index.js'
import { FollowRow } from './FollowTab.js'

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
    const { classes } = useStyles()
    const iterator = useFollowers(props.tab, props.address)
    const { loading, value, next, done, error, retry } = useIterator<IFollowIdentity>(iterator)
    const t = useI18N()

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

    return (
        <Box className={classes.root}>
            {value.length
                ? value.map((f: IFollowIdentity) => {
                      return <FollowRow key={f.address} identity={f} />
                  })
                : props.hint}
            <ElementAnchor callback={() => next?.()}>{!done && value.length !== 0 && <LoadingBase />}</ElementAnchor>
        </Box>
    )
}
