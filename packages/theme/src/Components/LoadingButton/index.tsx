import type { LoadingButtonProps } from '@material-ui/lab/LoadingButton'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { memo, useCallback, useState, forwardRef } from 'react'
import { CircularProgress } from '@material-ui/core'

interface MaskLoadingButtonProps extends Exclude<LoadingButtonProps, 'loading' | 'component'> {
    onClick(event: React.MouseEvent<HTMLButtonElement>): Promise<unknown>
    soloLoading?: boolean
}

export const MaskLoadingButton = memo(
    forwardRef<HTMLButtonElement, MaskLoadingButtonProps>((props, ref) => {
        const { onClick, children, soloLoading, variant, ...rest } = props
        // Solo loading doesn't apply when there is a left/right icon.
        const isSoloLoading = soloLoading && !props.startIcon && !props.endIcon && !props.loadingPosition
        const [loading, setLoading] = useState(false)

        const handleClick = useCallback(
            async (event: React.MouseEvent<HTMLButtonElement>) => {
                setLoading(true)
                try {
                    await onClick(event)
                    setLoading(false)
                } catch (error) {
                    setLoading(false)
                    if (typeof error === 'string') {
                        throw new Error(error)
                    }
                }
            },
            [onClick],
        )

        return (
            <LoadingButton
                loadingPosition={rest.startIcon ? 'start' : rest.endIcon ? 'end' : undefined}
                loading={loading}
                loadingIndicator={isSoloLoading ? <CircularProgress color="primary" size={16} /> : undefined}
                {...rest}
                onClick={handleClick}
                variant={isSoloLoading && loading ? 'text' : variant}
                component="button"
                ref={ref}
                children={children}
            />
        )
    }),
)
