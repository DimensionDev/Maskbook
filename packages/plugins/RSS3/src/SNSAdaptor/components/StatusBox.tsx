import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Box, Skeleton, Typography } from '@mui/material'
import { range } from 'lodash-unified'
import type { FC } from 'react'

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
        marginTop: theme.spacing(6),
        height: 380,
        flexDirection: 'column',
    },
    card: {
        marginTop: 16,
    },
}))

export const StatusBox: FC<Props> = ({ loading, empty, description }) => {
    const { classes } = useStyles()
    if (loading) {
        return (
            <Box margin="16px 0 0 16px">
                {range(3).map((i) => (
                    <Box className={classes.card} key={i}>
                        <Skeleton animation="wave" variant="rectangular" width={565} height={125} />
                    </Box>
                ))}
            </Box>
        )
    }

    if (empty) {
        return (
            <Box className={classes.statusBox}>
                <Icons.EmptySimple size={32} />
                <Typography
                    marginTop="10px"
                    color={(theme) => theme.palette.maskColor.second}
                    fontSize="14px"
                    fontWeight={400}>
                    {description}
                </Typography>
            </Box>
        )
    }
    return null
}
