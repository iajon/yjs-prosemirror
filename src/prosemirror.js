/* eslint-env browser */

import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { ySyncPlugin, yCursorPlugin, yUndoPlugin, undo, redo } from 'y-prosemirror'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { schema } from './schema.js'
import { exampleSetup } from 'prosemirror-example-setup'
import { keymap } from 'prosemirror-keymap'

window.addEventListener('load', () => {
    const ydoc = new Y.Doc()
    const provider = new WebrtcProvider('prosemirror-build', ydoc)
    const awareness = provider.awareness
    const yXmlFragment = ydoc.getXmlFragment('prosemirror')

    // An example for setting usernames / colors
    const colors = [
        '#00fbff',
        '#07c101',
        '#0073c7',
    ]
    const usernames = [
        'Leigh Powell',
        'Malcolm Delgado',
        'Elisa Goodman'
    ]
    awareness.setLocalStateField('user', {
        name: usernames[Math.floor(Math.random() * usernames.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
    })

    const editor = document.createElement('div')
    editor.setAttribute('id', 'editor')
    const editorContainer = document.createElement('div')
    editorContainer.insertBefore(editor, null)
    const prosemirrorView = new EditorView(editor, {
        state: EditorState.create({
            schema,
            plugins: [
                ySyncPlugin(yXmlFragment),
                yCursorPlugin(provider.awareness),
                yUndoPlugin(),
                keymap({
                    'Mod-z': undo,
                    'Mod-y': redo,
                    'Mod-Shift-z': redo
                })
            ].concat(exampleSetup({ schema }))
        })
    })
    document.body.insertBefore(editorContainer, null)

    const connectBtn = /** @type {HTMLElement} */ (document.getElementById('y-connect-btn'))
    connectBtn.addEventListener('click', () => {
        if (provider.shouldConnect) {
            provider.disconnect()
            connectBtn.textContent = 'Connect'
        } else {
            provider.connect()
            connectBtn.textContent = 'Disconnect'
        }
    })

    // @ts-ignore
    window.example = { provider, ydoc, yXmlFragment, prosemirrorView }
})