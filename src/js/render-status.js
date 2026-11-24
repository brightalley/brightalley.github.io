import {marked} from 'marked'

// Everything from this heading onwards is wrapped in <section class="status-history">,
// so the page template can style the history without markup in content/status.md.
const HISTORY_HEADING = /^##[ \t]+Historie[ \t]*$/m

/**
 * Renders the status markdown to HTML. Shared by the build (vite.config.js) and the admin preview.
 */
export function renderStatus(markdown) {
    const match = markdown.match(HISTORY_HEADING)
    if (!match) return marked.parse(markdown)

    const current = markdown.slice(0, match.index)
    const history = markdown.slice(match.index)
    return `${marked.parse(current)}<section class="status-history">${marked.parse(history)}</section>`
}
