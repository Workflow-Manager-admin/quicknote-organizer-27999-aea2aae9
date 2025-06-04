'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// PUBLIC_INTERFACE
export default function QuickNoteOrganizer() {
  /**
   * Main container component for QuickNote Organizer application.
   * Provides functionality for creating, editing, deleting, and searching notes.
   */
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('quicknotes');
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: Note) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(parsedNotes);
      } catch (error) {
        console.error('Error loading notes from localStorage:', error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('quicknotes', JSON.stringify(notes));
  }, [notes]);

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PUBLIC_INTERFACE
  const openCreateModal = () => {
    /**
     * Opens the modal for creating a new note.
     */
    setEditingNote(null);
    setModalTitle('');
    setModalContent('');
    setIsModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const openEditModal = (note: Note) => {
    /**
     * Opens the modal for editing an existing note.
     */
    setEditingNote(note);
    setModalTitle(note.title);
    setModalContent(note.content);
    setIsModalOpen(true);
  };

  // PUBLIC_INTERFACE
  const closeModal = () => {
    /**
     * Closes the note creation/editing modal.
     */
    setIsModalOpen(false);
    setEditingNote(null);
    setModalTitle('');
    setModalContent('');
  };

  // PUBLIC_INTERFACE
  const saveNote = () => {
    /**
     * Saves a new note or updates an existing note.
     */
    if (!modalTitle.trim()) {
      alert('Please enter a note title');
      return;
    }

    const now = new Date();

    if (editingNote) {
      // Update existing note
      setNotes(notes.map(note =>
        note.id === editingNote.id
          ? { ...note, title: modalTitle, content: modalContent, updatedAt: now }
          : note
      ));
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: modalTitle,
        content: modalContent,
        createdAt: now,
        updatedAt: now
      };
      setNotes([newNote, ...notes]);
    }

    closeModal();
  };

  // PUBLIC_INTERFACE
  const deleteNote = (noteId: string) => {
    /**
     * Deletes a note after user confirmation.
     */
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
    }
  };

  // PUBLIC_INTERFACE
  const formatDate = (date: Date) => {
    /**
     * Formats a date for display in the note list.
     */
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // PUBLIC_INTERFACE
  const truncateContent = (content: string, maxLength: number = 100) => {
    /**
     * Truncates note content for display in the list view.
     */
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Search Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4" style={{ color: 'var(--primary)' }}>
            📝 QuickNote Organizer
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes..."
              className="search-bar w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <h2 className="empty-state-title">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h2>
            <p className="empty-state-description">
              {searchTerm 
                ? `No notes match "${searchTerm}". Try a different search term.`
                : 'Start organizing your thoughts by creating your first note!'
              }
            </p>
            {!searchTerm && (
              <button 
                className="btn btn-primary mt-4"
                onClick={openCreateModal}
              >
                Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <div key={note.id} className="note-card">
                <div onClick={() => openEditModal(note)}>
                  <h3 className="note-title">{note.title}</h3>
                  {note.content && (
                    <p className="note-content">
                      {truncateContent(note.content)}
                    </p>
                  )}
                  <div className="text-xs text-gray-500 mb-3">
                    Last updated: {formatDate(note.updatedAt)}
                  </div>
                </div>
                <div className="note-actions">
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(note);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        className="floating-action-btn"
        onClick={openCreateModal}
        title="Add new note"
      >
        +
      </button>

      {/* Modal for Creating/Editing Notes */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="note-title">
                Title *
              </label>
              <input
                id="note-title"
                type="text"
                className="form-input"
                placeholder="Enter note title..."
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="note-content">
                Content
              </label>
              <textarea
                id="note-content"
                className="form-textarea"
                placeholder="Enter note content..."
                value={modalContent}
                onChange={(e) => setModalContent(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={saveNote}
              >
                {editingNote ? 'Update Note' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
