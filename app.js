// ====================
// Constants & Helpers
// ====================
const DASHBOARD_KEY = 'ebook-study-notes';
const NOTEBOOK_KEY  = 'notebook-app-data';

function getNotes() {
    try {
        return JSON.parse(localStorage.getItem(DASHBOARD_KEY)) || [];
    } catch {
        return [];
    }
}

function saveNotes(notes) {
    localStorage.setItem(DASHBOARD_KEY, JSON.stringify(notes));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function formatDate(iso) {
    if (!iso) return 'Never';
    try {
        return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return 'Never';
    }
}

function showToast(msg = 'Note Saved') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${msg}`;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hidden');
    }, 2200);
}

// ====================
// Dashboard Logic
// ====================
function deleteNoteFromDashboard(index) {
    const password = prompt('Please enter the password to delete this note:');
    if (password !== 'Dhanraj@974') {
        alert('Incorrect password! Note not deleted.');
        return;
    }
    
    if (!confirm('Delete this note permanently?')) return;
    
    let notes = getNotes();
    notes.splice(index, 1);
    saveNotes(notes);
    renderDashboard();
    showToast('Note deleted');
}

function renderDashboard() {
    const notesGrid = document.getElementById('notes-grid');
    if (!notesGrid) return;
    
    const notes = getNotes();
    
    if (notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-notes">
                <i class="fas fa-feather-alt"></i>
                <h3>No notes yet</h3>
                <p>Start writing your first note to see it here</p>
                <a href="write.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Create your first note</a>
            </div>
        `;
        return;
    }
    
    notesGrid.innerHTML = notes.map((note, index) => `
        <div class="note-card" data-index="${index}">
            <div class="note-card-header">
                <h3><i class="fas fa-file-alt"></i> ${note.title || 'Untitled'}</h3>
                <button class="delete-card-btn" data-index="${index}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <p>${note.content ? note.content : 'No content'}</p>
            <div class="note-date"><i class="far fa-clock"></i> ${formatDate(note.updatedAt || note.createdAt)}</div>
        </div>
    `).join('');
    
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.delete-card-btn')) return;
            const index = parseInt(this.dataset.index);
            const notes = getNotes();
            if (notes[index]) {
                const data = {
                    content: notes[index].content || '',
                    lastSaved: notes[index].updatedAt || notes[index].createdAt || new Date().toISOString(),
                    title: notes[index].title || 'Untitled',
                    index: index
                };
                localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(data));
            }
            window.location.href = 'write.html';
        });
    });
    
    document.querySelectorAll('.delete-card-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.dataset.index);
            deleteNoteFromDashboard(index);
        });
    });
}

// ====================
// Write Page Logic
// ====================
let autoSaveTimer = null;
let hasUnsaved = false;

function loadNotebookNote() {
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('note-title');
    const lastSavedEl = document.getElementById('last-saved');
    if (!editor) return;
    
    const raw = localStorage.getItem(NOTEBOOK_KEY);
    if (raw) {
        try {
            const data = JSON.parse(raw);
            editor.value = data.content || '';
            if (titleInput) titleInput.value = data.title || '';
            if (lastSavedEl) lastSavedEl.textContent = formatDate(data.lastSaved);
        } catch {}
    } else {
        editor.value = '';
        if (titleInput) titleInput.value = '';
        if (lastSavedEl) lastSavedEl.textContent = 'Never';
    }
    
    updateCounters();
    hasUnsaved = false;
    const unsavedIndicator = document.getElementById('unsaved-indicator');
    if (unsavedIndicator) unsavedIndicator.classList.add('hidden');
}

function updateCounters() {
    const editor = document.getElementById('editor');
    const wordCounter = document.getElementById('word-counter');
    const charCounter = document.getElementById('char-counter');
    if (!editor) return;
    
    const text = editor.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    if (wordCounter) wordCounter.textContent = words;
    if (charCounter) charCounter.textContent = chars;
}

function startAutoSave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveNotebookNote(false);
    }, 4000);
}

function saveNotebookNote(showToastMsg = true) {
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('note-title');
    const lastSavedEl = document.getElementById('last-saved');
    if (!editor) return;
    
    const content = editor.value;
    const title = titleInput ? titleInput.value.trim() || 'Untitled' : 'Untitled';
    const now = new Date().toISOString();
    
    let existingData = {};
    let index = undefined;
    try {
        const raw = localStorage.getItem(NOTEBOOK_KEY);
        if (raw) {
            existingData = JSON.parse(raw);
            if (existingData.index !== undefined) index = existingData.index;
        }
    } catch {}
    
    const notebookData = { content, title, lastSaved: now };
    if (index !== undefined) notebookData.index = index;
    localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(notebookData));
    
    const notes = getNotes();
    if (index !== undefined && notes[index]) {
        notes[index].content = content;
        notes[index].title = title;
        notes[index].updatedAt = now;
    } else {
        const newNote = {
            id: generateId(),
            title: title,
            content: content,
            createdAt: now,
            updatedAt: now
        };
        notes.unshift(newNote);
        notebookData.index = 0;
        localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(notebookData));
    }
    
    saveNotes(notes);
    
    hasUnsaved = false;
    const unsavedIndicator = document.getElementById('unsaved-indicator');
    if (unsavedIndicator) unsavedIndicator.classList.add('hidden');
    if (lastSavedEl) lastSavedEl.textContent = formatDate(now);
    if (showToastMsg) showToast('Note saved');
}

function deleteNotebookNote() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const password = prompt('Please enter the password to delete this note:');
    if (password !== 'Dhanraj@974') {
        alert('Incorrect password! Note not deleted.');
        return;
    }
    
    if (!confirm('Delete this note permanently?')) return;
    
    localStorage.removeItem(NOTEBOOK_KEY);
    editor.value = '';
    updateCounters();
    const lastSavedEl = document.getElementById('last-saved');
    if (lastSavedEl) lastSavedEl.textContent = 'Never';
    hasUnsaved = false;
    const unsavedIndicator = document.getElementById('unsaved-indicator');
    if (unsavedIndicator) unsavedIndicator.classList.add('hidden');
    
    let notes = getNotes();
    let idx = -1;
    try {
        const old = JSON.parse(localStorage.getItem(NOTEBOOK_KEY) || '{}');
        if (old.index !== undefined) idx = old.index;
    } catch {}
    
    if (idx !== -1 && notes[idx]) {
        notes.splice(idx, 1);
        saveNotes(notes);
    }
    
    showToast('Note deleted');
}

function downloadNote() {
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('note-title');
    if (!editor) return;
    
    const text = editor.value || '';
    const title = titleInput ? titleInput.value.trim() || 'notes' : 'notes';
    const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '_'); // Sanitize filename
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizedTitle}-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function printNote() {
    window.print();
}

function initWritePage() {
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('note-title');
    if (!editor) return;
    
    loadNotebookNote();
    
    const handleNoteChange = () => {
        updateCounters();
        hasUnsaved = true;
        const unsavedIndicator = document.getElementById('unsaved-indicator');
        if (unsavedIndicator) unsavedIndicator.classList.remove('hidden');
        startAutoSave();
    };
    
    editor.addEventListener('input', handleNoteChange);
    if (titleInput) titleInput.addEventListener('input', handleNoteChange);
    
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) saveBtn.addEventListener('click', () => saveNotebookNote(true));
    
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) deleteBtn.addEventListener('click', deleteNotebookNote);
    
    const downloadBtn = document.getElementById('download-btn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadNote);
    
    const printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.addEventListener('click', printNote);
    
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey)) {
            if (e.key.toLowerCase() === 's') {
                e.preventDefault();
                saveNotebookNote(true);
            } else if (e.key.toLowerCase() === 'p') {
                e.preventDefault();
                printNote();
            }
        }
    });
}

// ====================
// Initialize App
// ====================
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    // Add click handlers for all "New Note" buttons
    document.querySelectorAll('[href="write.html"]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem(NOTEBOOK_KEY);
            window.location.href = 'write.html';
        });
    });
    
    if (path === 'index.html' || path === '') {
        renderDashboard();
    } else if (path === 'dashboard.html') {
        renderDashboard();
    } else if (path === 'write.html') {
        initWritePage();
    }
});