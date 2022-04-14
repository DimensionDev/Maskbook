import type { InjectedDialogClassKey, InjectedDialogProps } from '../components'

type ClassNameMap<ClassKey extends string = string> = { [P in ClassKey]: string }

interface ComponentOverwriteConfig<Props extends { classes?: any }, Classes extends string> {
    classes?: () => { classes: Partial<ClassNameMap<Classes>> }
    props?: (props: Props) => Props
}

export interface SharedComponentOverwrite {
    InjectedDialog?: ComponentOverwriteConfig<InjectedDialogProps, InjectedDialogClassKey>
}
