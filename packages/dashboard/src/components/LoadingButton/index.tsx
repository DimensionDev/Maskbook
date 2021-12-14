import { getMaskColor, makeStyles, MaskLoadingButton } from '@masknet/theme'
import { memo } from 'react'
import { LoadingAnimation } from '@masknet/shared'
import classNames from 'classnames'
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
    const { classes } = useStyles()
    return (
        <MaskLoadingButton
            className={classNames(classes.icon, props.loading ? classes.loadingButtonOverride : '')}
            variant="contained"
            loadingPosition="end"
            soloLoading={false}
            loadingIndicator={<LoadingAnimation />}
            onClick={onClick}
            {...rest}>
            {children}
        </MaskLoadingButton>
    )
})
