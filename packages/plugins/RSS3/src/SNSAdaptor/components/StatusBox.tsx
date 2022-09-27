import type { FC } from 'react'
import { range } from 'lodash-unified'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Skeleton, Typography } from '@mui/material'

interface Props {
    loading?: boolean
    empty?: boolean
    description?: string
}

const useStyles = makeStyles()((theme) => ({
    statusBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        flexDirection: 'column',
    },
}))

export const StatusBox: FC<Props> = ({ loading, empty, description }) => {
    const { classes } = useStyles()
    if (loading) {
        return (
            <>
                {range(3).map((i) => (
                    <Box mb={2} key={i}>
                        <Skeleton animation="wave" variant="rectangular" height={125} />
                    </Box>
                ))}
            </>
        )
    }

    if (empty) {
        return (
            <Box className={classes.statusBox}>
                <Icons.EmptySimple size={32} />
                <Typography color={(theme) => theme.palette.maskColor.second} fontSize="14px" fontWeight={400}>
                    {description}
                </Typography>
            </Box>
        )
    }
    return null
}
