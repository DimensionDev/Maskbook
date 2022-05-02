import { memo } from 'react'
import { Box, Typography } from '@mui/material'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { Icon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    prompt: {
        color: MaskColorVar.textLight,
        fontSize: theme.typography.pxToRem(12),
        lineHeight: theme.typography.pxToRem(16),
        marginTop: theme.spacing(2.5),
    },
    icon: {
        width: 96,
        height: 96,
        fill: 'none',
    },
}))

export interface EmptyPlaceholderProps extends React.PropsWithChildren<{}> {}

export const EmptyPlaceholder = memo<EmptyPlaceholderProps>(({ children }) => {
    const { classes } = useStyles()
    return (
        <Box className={classes.container}>
            <Icon type="empty" className={classes.icon} />
            <Typography className={classes.prompt}>{children}</Typography>
        </Box>
    )
})
