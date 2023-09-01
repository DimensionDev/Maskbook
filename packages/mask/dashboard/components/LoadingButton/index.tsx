import { getMaskColor, makeStyles, MaskLoadingButton, LoadingBase } from '@masknet/theme'
import { memo } from 'react'
import type { LoadingButtonProps } from '@mui/lab'

interface DashboardLoadingButtonProps extends LoadingButtonProps {
    onClick(event: React.MouseEvent<HTMLButtonElement>): Promise<unknown>
}
const useStyles = makeStyles()((theme) => ({
    icon: {
        color: getMaskColor(theme).white,
        width: '100%',
    },
    loadingButtonOverride: {
        opacity: '1 !important',
    },
}))

export const LoadingButton = memo<DashboardLoadingButtonProps>((props) => {
    const { onClick, children, ...rest } = props
    const { classes, cx } = useStyles()
    return (
        <MaskLoadingButton
            className={cx(classes.icon, props.loading ? classes.loadingButtonOverride : '')}
            variant="contained"
            loadingPosition="end"
            soloLoading={false}
            fullWidth
            loadingIndicator={<LoadingBase style={{ fontSize: '1.2rem' }} />}
            onClick={onClick}
            {...rest}>
            {children}
        </MaskLoadingButton>
    )
})
