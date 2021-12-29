export async function prettier(f: string) {
    const { format } = await import('prettier')
    return format(f, {
        parser: 'typescript',
        trailingComma: 'all',
        printWidth: 120,
        semi: false,
        singleQuote: true,
        tabWidth: 4,
    })
}
