type ExtraKeys<S extends string> = S extends `${infer HEAD}{${infer K}}${infer TAIL}`
    ? K extends '}'
        ? never
        : ExtraKeys<HEAD> | K | ExtraKeys<TAIL>
    : never

export function renderString<T extends string>(template: T, data: Record<ExtraKeys<T>, string | number>) {
    return template.replace(/{{([^}]+)}}/gm, (match, p1: keyof typeof data) => data[p1]?.toString() ?? match)
}
