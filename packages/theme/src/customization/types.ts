type ClassNameMap<ClassKey extends string = string> = { [P in ClassKey]: string }

export interface ComponentOverwriteConfig<Props extends { classes?: any }, Classes extends string> {
    classes?: () => { classes: Partial<ClassNameMap<Classes>> }
    props?: (props: Props) => Props
}
