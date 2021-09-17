import { getMaskColor, makeStyles, MaskLoadingButton } from '@masknet/theme'
import { memo } from 'react'
import { ButtonProps, Stack } from '@material-ui/core'
import { LoadingAnimation } from '@masknet/shared'

interface LoadingButtonProps extends ButtonProps {
    onClick(event: React.MouseEvent<HTMLButtonElement>): Promise<unknown>
}
const useStyles = makeStyles()((theme) => ({
    icon: {
        color: getMaskColor(theme).white,
    },
}))

export const LoadingButton = memo<LoadingButtonProps>((props) => {
    const { onClick, children, ...rest } = props
    const { classes } = useStyles()
    return (
        <MaskLoadingButton
            classes={{
                loadingIndicator: classes.icon,
            }}
            soloLoading={false}
            loadingIndicator={
                <Stack width="100%" direction="row" alignItems="center" gap={1} justifyContent="center">
                    {children}
                    <LoadingAnimation />
                </Stack>
            }
            {...rest}
            onClick={onClick}>
            {children}
        </MaskLoadingButton>
    )
})
