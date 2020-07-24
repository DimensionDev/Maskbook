import WebSocket, { Server } from 'ws'
import { watch } from 'gulp'
import { output } from './paths'
import { posix } from 'path'
import { pathToFileURL } from 'url'
export function hmrServer() {
    const server = new Server({ port: 7687 })
    const clients = new Set<WebSocket>()
    server.addListener('connection', (client) => {
        clients.add(client)
        client.addListener('close', () => clients.delete(client))
    })
    const watcher = watch(output.extension.folder)
    watcher.addListener('change', (fileName) => {
        const url = pathToFileURL(fileName).href
        const r = posix.relative(pathToFileURL(output.extension.folder).href, url)
        console.log(r, 'changed')
        for (const each of clients) each.send(r)
    })
}
