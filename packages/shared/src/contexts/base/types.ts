import type { ComponentOverwriteConfig } from '@masknet/theme'
import type { InjectedDialogClassKey, InjectedDialogProps } from '../components'

export interface SharedComponentOverwrite {
    InjectedDialog?: ComponentOverwriteConfig<InjectedDialogProps, InjectedDialogClassKey>
}
