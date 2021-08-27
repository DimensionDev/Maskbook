import type { LoadingButtonProps } from '@material-ui/lab/LoadingButton'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { memo, useCallback, useState } from 'react'

interface MaskLoadingButtonProps extends Exclude<LoadingButtonProps, 'loading'> {
    onClick(event: React.MouseEvent<HTMLButtonElement>): Promise<unknown>
    clearStyle?: boolean
}

export const MaskLoadingButton = memo<MaskLoadingButtonProps>((props) => {
    const { onClick, children, clearStyle, variant, ...rest } = props
    const [loading, setLoading] = useState(false)

    const handleClick = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement>) => {
            setLoading(true)
            try {
                await onClick(event)
                setLoading(false)
            } catch (error) {
                setLoading(false)
                throw new Error(error as string)
            }
        },
        [onClick],
    )

    return (
        <LoadingButton
            loading={loading}
            onClick={handleClick}
            {...rest}
            variant={clearStyle && loading ? 'text' : variant}>
            {children}
        </LoadingButton>
    )
})
