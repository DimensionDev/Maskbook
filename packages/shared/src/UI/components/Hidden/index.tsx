import type { PropsWithChildren } from 'react'
import { makeStyles } from '@masknet/theme'

const useStyle = makeStyles()((theme) => ({
    hidden: {
        visibility: 'hidden',
        height: 0,
    },
}))

export function Hidden({ hidden, children }: PropsWithChildren<{ hidden: boolean }>) {
    const { classes } = useStyle()
    return <div className={hidden ? classes.hidden : ''}>{children}</div>
}
