import type { ComponentOverwriteConfig } from '@masknet/theme'
import type { InjectedDialogClassKey, InjectedDialogProps } from '../components'

export interface RuntimeComponentOverwrite {
    InjectedDialog?: ComponentOverwriteConfig<InjectedDialogProps, InjectedDialogClassKey>
}
