import { useContext, useRef, useEffect, useState, useMemo } from 'react'
import { Card, createStyles, makeStyles, CardContent, CardHeader, Box, Typography } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { SnapshotContext } from '../context'
import { useVotes } from '../hooks/useVotes'
import { SnapshotCard } from './SnapshotCard'

export interface VotesCardProps {}

const useStyles = makeStyles((theme) => {
    return createStyles({})
})

export function VotesCard(props: VotesCardProps) {
    const { t } = useI18N()
    const identifier = useContext(SnapshotContext)
    const classes = useStyles()

    return (
        <SnapshotCard title="Votes">
            <Typography>This is votes card.</Typography>
        </SnapshotCard>
    )
}
