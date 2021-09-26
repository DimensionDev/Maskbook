import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { NetworkSelector } from '../../../../components/NetworkSelector'

const useStyles = makeStyles()({
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 12,
        color: '#151818',
        lineHeight: 1.5,
        fontWeight: 500,
    },
})

export interface PageHeaderProps {
    title: string
}

export const PageHeader = memo<PageHeaderProps>(({ title }) => {
    const { classes } = useStyles()
    return (
        <div className={classes.header}>
            <Typography className={classes.title}>{title}</Typography>
            <NetworkSelector />
        </div>
    )
})
