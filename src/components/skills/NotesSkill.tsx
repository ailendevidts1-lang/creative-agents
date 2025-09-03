import React, { useState } from 'react';
import { StickyNote, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSkills, Note } from '@/hooks/useSkills';

export function NotesSkill() {
  const { notes, createNote, updateNote, deleteNote } = useSkills();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });
  const [editNote, setEditNote] = useState({ title: '', content: '', tags: '' });

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;

    const tags = newNote.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    await createNote(newNote.title.trim(), newNote.content || undefined, tags.length > 0 ? tags : undefined);
    
    setNewNote({ title: '', content: '', tags: '' });
    setShowCreateForm(false);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditNote({
      title: note.title,
      content: note.content || '',
      tags: note.tags?.join(', ') || ''
    });
  };

  const handleSaveEdit = async (noteId: string) => {
    const tags = editNote.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    await updateNote(noteId, {
      title: editNote.title.trim(),
      content: editNote.content || undefined,
      tags: tags.length > 0 ? tags : undefined
    });
    
    setEditingNote(null);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditNote({ title: '', content: '', tags: '' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-accent/10">
            <StickyNote className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Notes</h3>
            <p className="text-muted-foreground text-sm">Quick notes and reminders</p>
          </div>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="outline"
          size="sm"
          className="glass-panel"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {showCreateForm && (
        <Card className="glass-panel p-6">
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Note title..."
                className="glass-panel mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Content</label>
              <Textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note here..."
                rows={4}
                className="glass-panel mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Tags</label>
              <Input
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                placeholder="work, personal, ideas (comma separated)"
                className="glass-panel mt-1"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Create Note
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.length === 0 ? (
          <div className="col-span-full glass-panel p-8 text-center">
            <StickyNote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notes yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first note to get started
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isEditing={editingNote === note.id}
              editData={editNote}
              onEdit={() => handleEditNote(note)}
              onSave={() => handleSaveEdit(note.id)}
              onCancel={handleCancelEdit}
              onDelete={() => deleteNote(note.id)}
              onEditChange={setEditNote}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  editData: { title: string; content: string; tags: string };
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEditChange: (data: { title: string; content: string; tags: string }) => void;
}

function NoteCard({ 
  note, 
  isEditing, 
  editData, 
  onEdit, 
  onSave, 
  onCancel, 
  onDelete, 
  onEditChange 
}: NoteCardProps) {
  if (isEditing) {
    return (
      <Card className="glass-panel p-4 space-y-3">
        <Input
          value={editData.title}
          onChange={(e) => onEditChange({ ...editData, title: e.target.value })}
          className="font-medium glass-panel"
        />
        <Textarea
          value={editData.content}
          onChange={(e) => onEditChange({ ...editData, content: e.target.value })}
          rows={4}
          className="glass-panel"
        />
        <Input
          value={editData.tags}
          onChange={(e) => onEditChange({ ...editData, tags: e.target.value })}
          placeholder="Tags (comma separated)"
          className="glass-panel"
        />
        <div className="flex space-x-2">
          <Button onClick={onSave} size="sm" className="flex-1">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button onClick={onCancel} variant="outline" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-panel p-4 space-y-3 hover:border-primary/20 transition-all duration-200">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-foreground line-clamp-2">{note.title}</h4>
        <div className="flex space-x-1 ml-2">
          <Button onClick={onEdit} variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Edit className="w-3 h-3" />
          </Button>
          <Button 
            onClick={onDelete} 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {note.content && (
        <p className="text-sm text-muted-foreground line-clamp-3">
          {note.content}
        </p>
      )}
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground">
        {(() => {
          const formatDate = (dateString: string) => {
            return new Date(dateString).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          };
          return `Updated ${formatDate(note.updated_at)}`;
        })()}
      </div>
    </Card>
  );
}