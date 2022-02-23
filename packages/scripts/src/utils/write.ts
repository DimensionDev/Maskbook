import { readFile, writeFile } from 'fs/promises'
import { prettier } from './prettier'

export async function changeFile(path: string, f: (x: string) => string | Promise<string>) {
    const content = await readFile(path, 'utf8')
    const newContent = f(content)
    await writeFile(path, await newContent)
}
changeFile.JSON = (path: string, f: (x: any) => void) => {
    return changeFile(path, (content) => {
        const obj = JSON.parse(content)
        f(obj)
        return prettier(JSON.stringify(obj), 'json')
    })
}
changeFile.typescript = (path: string, f: (x: string) => string) => {
    return changeFile(path, (content) => prettier(f(content), 'typescript'))
}
