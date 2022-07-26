import { Box, Button } from '@mui/material'
import type { ButtonProps } from '@mui/material/Button'
import { CircleLoadingAnimation } from '../LoadingAnimation'
import { makeStyles } from '../../UIHelper'

export interface ActionButtonProps extends ButtonProps {
    width?: number | string
    loading?: boolean
    component?: keyof JSX.IntrinsicElements | React.ComponentType<any>
}

const useStyles = makeStyles()(() => ({
    loading: {
        ['& > *']: {
            opacity: 0.3,
        },
    },
}))

export function ActionButton<T extends React.ComponentType<any> = React.ComponentType<{}>>(
    props: ActionButtonProps & PropsOf<T>,
) {
    const { width, loading, children, className, style, ...rest } = props
    const { classes, cx } = useStyles()
    return (
        <Button
            disableElevation
            className={cx('actionButton', className, loading ? classes.loading : undefined)}
            style={{ width, ...style, pointerEvents: loading ? 'none' : undefined }}
            {...rest}
            disabled={rest.disabled && !loading}>
            {loading ? (
                <Box
                    position="absolute"
                    width="100%"
                    height="100%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ opacity: 1 }}>
                    <CircleLoadingAnimation />
                </Box>
            ) : null}
            <span>{children}</span>
        </Button>
    )
}
