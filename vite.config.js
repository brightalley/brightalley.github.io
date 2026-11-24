import {defineConfig} from 'vite'
import {resolve} from 'node:path'
import {readFileSync} from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import {renderStatus} from './src/js/render-status.js'

const statusFile = resolve(__dirname, 'content/status.md')

/**
 * Renders content/status.md into index.html at build time (and on every request in dev),
 * so the status page is plain HTML and readable without JavaScript.
 */
function statusMarkdown() {
    return {
        name: 'status-markdown',
        transformIndexHtml: {
            order: 'pre',
            handler(html, ctx) {
                if (!ctx.path.endsWith('/index.html') || ctx.path.startsWith('/admin')) return html
                const markdown = readFileSync(statusFile, 'utf-8')
                const updated = new Date().toLocaleString('nl-NL', {
                    timeZone: 'Europe/Amsterdam', dateStyle: 'long', timeStyle: 'short',
                })
                return html
                    .replace('<!--status-content-->', renderStatus(markdown))
                    .replace('<!--status-updated-->', updated)
            },
        },
        configureServer(server) {
            server.watcher.add(statusFile)
            server.watcher.on('change', (file) => {
                if (file === statusFile) server.ws.send({type: 'full-reload'})
            })
        },
    }
}

export default defineConfig({
    plugins: [tailwindcss(), statusMarkdown()],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin/index.html'),
            },
        },
    },
})
