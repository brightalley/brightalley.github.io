import {marked} from 'marked'

// Repository that hosts the status page. Commits to BRANCH trigger the GitHub Pages deployment.
const OWNER = 'brightalley'
const REPO = 'brightalley.github.io'
const BRANCH = 'main'
const FILE_PATH = 'content/status.md'

const API = `https://api.github.com/repos/${OWNER}/${REPO}`
const TOKEN_KEY = 'status-admin-token'

const $ = (id) => document.getElementById(id)
const els = {
    login: $('login'), loginForm: $('login-form'), token: $('token'),
    editor: $('editor'), markdown: $('markdown'), preview: $('preview'),
    saveForm: $('save-form'), commitMessage: $('commit-message'), save: $('save'),
    message: $('message'), logout: $('logout'),
}

let fileSha = null

$('repo-name').textContent = `${OWNER}/${REPO}`
$('branch-name').textContent = BRANCH

function getToken() {
    try { return sessionStorage.getItem(TOKEN_KEY) } catch { return null }
}

function setToken(token) {
    try { token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
}

function showMessage(text, type = 'info') {
    const styles = {
        info: 'bg-blue-50 text-blue-900',
        success: 'bg-green-50 text-green-900',
        error: 'bg-red-50 text-red-900',
    }
    els.message.className = `mb-6 rounded p-4 text-sm ${styles[type]}`
    els.message.innerHTML = text
}

function hideMessage() {
    els.message.className = 'hidden'
}

async function github(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${getToken()}`,
            'X-GitHub-Api-Version': '2022-11-28',
            ...(options.body ? {'Content-Type': 'application/json'} : {}),
        },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
        const error = new Error(data.message || `GitHub API fout (${response.status})`)
        error.status = response.status
        throw error
    }
    return data
}

// UTF-8 safe base64 helpers (status texts contain emoji and accented characters).
const decodeBase64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)))
const encodeBase64 = (text) => btoa(Array.from(new TextEncoder().encode(text), (b) => String.fromCharCode(b)).join(''))

function renderPreview() {
    els.preview.innerHTML = marked.parse(els.markdown.value)
}

async function loadFile() {
    const file = await github(`/contents/${FILE_PATH}?ref=${BRANCH}`)
    fileSha = file.sha
    els.markdown.value = decodeBase64(file.content)
    renderPreview()
}

async function authenticate() {
    // Only accept tokens that actually have write access to the repository.
    const repo = await github('')
    if (!repo.permissions?.push) {
        throw new Error('Dit token heeft geen schrijfrechten op de repository.')
    }
    await loadFile()
    els.login.classList.add('hidden')
    els.editor.classList.remove('hidden')
    els.logout.classList.remove('hidden')
}

function logout() {
    setToken(null)
    fileSha = null
    els.markdown.value = ''
    els.preview.innerHTML = ''
    els.editor.classList.add('hidden')
    els.logout.classList.add('hidden')
    els.login.classList.remove('hidden')
}

els.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    hideMessage()
    setToken(els.token.value.trim())
    els.token.value = ''
    try {
        await authenticate()
    } catch (error) {
        logout()
        showMessage(`Inloggen mislukt: ${error.status === 401 ? 'ongeldig token.' : error.message}`, 'error')
    }
})

els.saveForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    hideMessage()
    els.save.disabled = true
    try {
        const result = await github(`/contents/${FILE_PATH}`, {
            method: 'PUT',
            body: JSON.stringify({
                message: `[STATUS] ${els.commitMessage.value.trim()}`,
                content: encodeBase64(els.markdown.value),
                sha: fileSha,
                branch: BRANCH,
            }),
        })
        fileSha = result.content.sha
        els.commitMessage.value = ''
        showMessage(
            `Gepubliceerd. De statuspagina wordt binnen enkele minuten bijgewerkt. ` +
            `<a class="underline" href="https://github.com/${OWNER}/${REPO}/actions" target="_blank" rel="noopener">Bekijk de deployment</a>.`,
            'success',
        )
    } catch (error) {
        if (error.status === 409) {
            showMessage('Het bestand is intussen door iemand anders gewijzigd. Kopieer je wijzigingen, herlaad de pagina en probeer opnieuw.', 'error')
        } else if (error.status === 401) {
            logout()
            showMessage('Je sessie is verlopen. Log opnieuw in.', 'error')
        } else {
            showMessage(`Publiceren mislukt: ${error.message}`, 'error')
        }
    } finally {
        els.save.disabled = false
    }
})

els.markdown.addEventListener('input', renderPreview)
els.logout.addEventListener('click', logout)

if (getToken()) {
    authenticate().catch(() => logout())
}
