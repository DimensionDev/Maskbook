import type { InjectedDialogClassKey } from '../components/index.js'

type ClassNameMap<ClassKey extends string = string> = {
    [P in ClassKey]: string
}

interface ComponentOverwriteConfig<Classes extends string> {
    classes?: () => {
        classes: Partial<ClassNameMap<Classes>>
    }
}

export interface SharedComponentOverwrite {
    InjectedDialog?: ComponentOverwriteConfig<InjectedDialogClassKey>
}
