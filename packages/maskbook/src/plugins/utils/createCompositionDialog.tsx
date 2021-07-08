import { ValueRef } from '@dimensiondev/holoflows-kit'
import { useValueRef } from '@masknet/shared'
import type { PluginConfig } from '../types'

export function createCompositionDialog(
    label: string | React.ReactNode,
    DialogComponent: React.ComponentType<{ open: boolean; onClose(): void }>,
    /** If return false, the dialog is not opened. */
    onClick?: () => Promise<boolean | undefined>,
): [NonNullable<PluginConfig['postDialogEntries']>[0], React.ComponentType<{}>] {
    const open = new ValueRef(false)
    return [
        {
            label,
            onClick: async () => {
                const result = await onClick?.()
                if (result === false) return
                open.value = true
            },
        },
        () => {
            const opening = useValueRef(open)
            return <DialogComponent open={opening} onClose={() => (open.value = false)} />
        },
    ]
}
