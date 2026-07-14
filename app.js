
// ====================
// Constants & Helpers
// ====================
const DASHBOARD_KEY = 'ebook-study-notes';
const NOTEBOOK_KEY = 'notebook-app-data';
let activeCategory = 'all'; // Track active filter category

function getNotes() {
    try {
        console.log('getNotes - localStorage contents:', { ...localStorage });
        const stored = localStorage.getItem(DASHBOARD_KEY);
        console.log('getNotes - stored data for', DASHBOARD_KEY, ':', stored);
        let notes = JSON.parse(stored) || [];
        
        // Ensure all notes have category
        notes = notes.map(note => ({
            ...note,
            category: note.category || 'general'
        }));
        
        console.log('getNotes - parsed notes:', notes);
        return notes;
    } catch (e) {
        console.error('getNotes error:', e);
        return [];
    }
}

function saveNotes(notes) {
    console.log('saveNotes - saving notes:', notes);
    localStorage.setItem(DASHBOARD_KEY, JSON.stringify(notes));
    console.log('saveNotes - notes saved');
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

function renderDashboard(searchQuery = '') {
    const notesContainer = document.getElementById('notes-container');
    console.log('renderDashboard - notesContainer exists:', !!notesContainer);
    if (!notesContainer) return;
    
    let notes = getNotes();
    console.log('renderDashboard - notes:', notes, 'length:', notes.length);
    
    // Filter notes by active category
    if (activeCategory !== 'all') {
        notes = notes.filter(note => note.category === activeCategory);
        console.log('renderDashboard - filtered by category:', activeCategory);
    }
    
    // Filter notes by search query
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        notes = notes.filter(note => 
            (note.title || '').toLowerCase().includes(query)
        );
        console.log('renderDashboard - filtered notes:', notes);
    }
    
    if (notes.length === 0) {
        if (searchQuery.trim()) {
            notesContainer.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-search"></i>
                    <h3>No notes found</h3>
                    <p>Try a different search term</p>
                    <a href="write.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Create a new note</a>
                </div>
            `;
        } else {
            notesContainer.innerHTML = `
                <div class="empty-notes">
                    <i class="fas fa-feather-alt"></i>
                    <h3>No notes yet</h3>
                    <p>Start writing your first note to see it here</p>
                    <a href="write.html" class="btn btn-primary"><i class="fas fa-plus-circle"></i> Create your first note</a>
                </div>
            `;
        }
        return;
    }
    
    let html = '';
    
    if (activeCategory === 'all') {
        // Show both categories when 'All' is selected
        let javaNotesHTML = '';
        let generalNotesHTML = '';
        
        // Use original notes array to get correct index for deletion/edit
        const allNotes = getNotes();
        notes.forEach((note) => {
            const originalIndex = allNotes.findIndex(n => n.id === note.id);
            if (originalIndex === -1) return;
            const noteHTML = renderNoteRow(note, originalIndex);
            if (note.category === 'java') {
                javaNotesHTML += noteHTML;
            } else {
                generalNotesHTML += noteHTML;
            }
        });
        
        if (javaNotesHTML) {
            html += `
                <div class="category-section">
                    <h2 class="category-title"><i class="fab fa-java"></i> Java Notes</h2>
                    <div class="table-wrapper">
                        <table class="notes-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Content</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${javaNotesHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        
        if (generalNotesHTML) {
            html += `
                <div class="category-section">
                    <h2 class="category-title"><i class="fas fa-file-alt"></i> General Notes</h2>
                    <div class="table-wrapper">
                        <table class="notes-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Content</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${generalNotesHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    } else {
        // Show single category when 'Java' or 'General' is selected
        let rowsHTML = '';
        
        // Use original notes array to get correct index for deletion/edit
        const allNotes = getNotes();
        notes.forEach((note) => {
            const originalIndex = allNotes.findIndex(n => n.id === note.id);
            if (originalIndex === -1) return;
            rowsHTML += renderNoteRow(note, originalIndex);
        });
        
        const sectionTitle = activeCategory === 'java' 
            ? '<i class="fab fa-java"></i> Java Notes' 
            : '<i class="fas fa-file-alt"></i> General Notes';
        
        html += `
            <div class="category-section">
                <h2 class="category-title">${sectionTitle}</h2>
                <div class="table-wrapper">
                    <table class="notes-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Content</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHTML}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    console.log('renderDashboard - final html to set:', html);
    notesContainer.innerHTML = html;
    console.log('renderDashboard - notesContainer.innerHTML after set:', notesContainer.innerHTML);
    
    document.querySelectorAll('.note-row').forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('.delete-row-btn')) return;
            const index = parseInt(this.dataset.index);
            const allNotes = getNotes();
            if (allNotes[index]) {
                const data = {
                    content: allNotes[index].content || '',
                    lastSaved: allNotes[index].updatedAt || allNotes[index].createdAt || new Date().toISOString(),
                    title: allNotes[index].title || 'Untitled',
                    category: allNotes[index].category || 'general',
                    index: index
                };
                localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(data));
            }
            window.location.href = 'write.html';
        });
    });
    
    document.querySelectorAll('.delete-row-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const index = parseInt(this.dataset.index);
            deleteNoteFromDashboard(index);
        });
    });
}

function renderNoteRow(note, index) {
    // Truncate content for table display
    const plainContent = note.content ? note.content.replace(/<[^>]*>/g, '') : 'No content';
    const truncatedContent = plainContent.length > 100 ? plainContent.substring(0, 100) + '...' : plainContent;
    
    return `
        <tr class="note-row" data-index="${index}">
            <td class="note-cell note-title">
                <i class="fas fa-file-alt" style="color: #3b82f6; margin-right: 0.5rem;"></i>
                ${note.title || 'Untitled'}
            </td>
            <td class="note-cell note-category">
                <span class="category-badge ${note.category === 'java' ? 'java-badge' : 'general-badge'}">
                    ${note.category === 'java' ? 'Java' : 'General'}
                </span>
            </td>
            <td class="note-cell note-content">${truncatedContent}</td>
            <td class="note-cell note-date">
                <i class="far fa-clock" style="margin-right: 0.3rem;"></i>
                ${formatDate(note.updatedAt || note.createdAt)}
            </td>
            <td class="note-cell note-actions">
                <button class="delete-row-btn" data-index="${index}" title="Delete note">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        </tr>
    `;
}

// ====================
// Write Page Logic
// ====================
let autoSaveTimer = null;
let hasUnsaved = false;

function insertImage(src) {
    const editor = document.getElementById('editor');
    if (!editor) return;
    const selection = window.getSelection();
    
    // Create image element
    const img = document.createElement('img');
    img.src = src;
    
    // Insert image
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(img);
        
        // Insert a newline after image for proper spacing
        const br = document.createElement('br');
        range.setStartAfter(img);
        range.collapse(true);
        range.insertNode(br);
        
        // Move cursor after the br
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        editor.appendChild(img);
        const br = document.createElement('br');
        editor.appendChild(br);
        // Move cursor to end
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    updateCounters();
    hasUnsaved = true;
    const unsavedIndicator = document.getElementById('unsaved-indicator');
    if (unsavedIndicator) unsavedIndicator.classList.remove('hidden');
    startAutoSave();
}

function handleImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => insertImage(e.target.result);
    reader.readAsDataURL(file);
}

function loadNotebookNote() {
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('note-title');
    const categoryInput = document.getElementById('note-category');
    const lastSavedEl = document.getElementById('last-saved');
    if (!editor) return;
    
    const raw = localStorage.getItem(NOTEBOOK_KEY);
    if (raw) {
        try {
            const data = JSON.parse(raw);
            editor.innerHTML = data.content || '';
            editor.classList.remove('placeholder');
            if (titleInput) titleInput.value = data.title || '';
            if (categoryInput) categoryInput.value = data.category || 'general';
            if (lastSavedEl) lastSavedEl.textContent = formatDate(data.lastSaved);
        } catch {}
    } else {
        editor.innerHTML = 'Start writing your notes here…';
        editor.classList.add('placeholder');
        if (titleInput) titleInput.value = '';
        if (categoryInput) categoryInput.value = 'general';
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
    
    const text = editor.textContent;
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
    console.log('saveNotebookNote - called');
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('note-title');
    const categoryInput = document.getElementById('note-category');
    const lastSavedEl = document.getElementById('last-saved');
    if (!editor) {
        console.log('saveNotebookNote - no editor found');
        return;
    }
    
    const content = editor.innerHTML;
    const title = titleInput ? titleInput.value.trim() || 'Untitled' : 'Untitled';
    const category = categoryInput ? categoryInput.value : 'general';
    console.log('saveNotebookNote - data:', { content, title, category });
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
    
    const notebookData = { content, title, category, lastSaved: now };
    if (index !== undefined) notebookData.index = index;
    localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(notebookData));
    
    const notes = getNotes();
    if (index !== undefined && notes[index]) {
        notes[index].content = content;
        notes[index].title = title;
        notes[index].category = category;
        notes[index].updatedAt = now;
    } else {
        const newNote = {
            id: generateId(),
            title: title,
            content: content,
            category: category,
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
    editor.innerHTML = '';
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
    
    const text = editor.textContent || '';
    const title = titleInput ? titleInput.value.trim() || 'notes' : 'notes';
    const sanitizedTitle = title.replace(/[<>:"/\\|?*]/g, '_');
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
    const categoryInput = document.getElementById('note-category');
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
    if (categoryInput) categoryInput.addEventListener('change', handleNoteChange);
    
    editor.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                handleImageFile(item.getAsFile());
                return;
            }
        }
    });
    
    // Clear placeholder text on focus
    editor.addEventListener('focus', () => {
        if (editor.classList.contains('placeholder')) {
            editor.innerHTML = '';
            editor.classList.remove('placeholder');
        }
    });
    
    // Restore placeholder if editor is empty on blur
    editor.addEventListener('blur', () => {
        if (editor.innerHTML === '' || editor.innerHTML === '<br>') {
            editor.innerHTML = 'Start writing your notes here…';
            editor.classList.add('placeholder');
        }
    });
    
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
    console.log('DOMContentLoaded - app.js initialized');
    const path = window.location.pathname.split('/').pop() || 'index.html';
    console.log('Current path:', path);
    
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
        
        // Add search listener
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderDashboard(e.target.value);
            });
        }
        
        // Add category toggle listeners
        const toggleBtns = document.querySelectorAll('.toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active category
                activeCategory = btn.dataset.category;
                
                // Update active button styling
                toggleBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Re-render dashboard with current search query
                const currentSearch = searchInput ? searchInput.value : '';
                renderDashboard(currentSearch);
            });
        });
    } else if (path === 'write.html') {
        initWritePage();
    }
});

