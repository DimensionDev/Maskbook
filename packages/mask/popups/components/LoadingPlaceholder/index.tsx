import { memo, type HTMLProps } from 'react'
import { makeStyles } from '@masknet/theme'
import { LoadingStatus } from '@masknet/shared'

const useStyles = makeStyles()({
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        flex: 1,
        gap: 12,
    },
})

interface LoadingPlaceholderProps extends HTMLProps<HTMLDivElement> {
    title?: string
}

export const LoadingPlaceholder = memo(function LoadingPlaceholder({ title, ...rest }: LoadingPlaceholderProps) {
    const { classes, cx } = useStyles()

    return (
        <main {...rest} className={cx(classes.container, rest.className)}>
            <LoadingStatus iconSize={24}>{title}</LoadingStatus>
        </main>
    )
})
