import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Wand2,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  FileText,
  Bookmark,
  Check,
} from 'lucide-react';
import { Project } from '../../types';
import { storage } from '../../services/storage';

interface MySpacesProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onRefreshProjects: () => void;
  onNewSpace: () => void;
}

export const MySpaces: React.FC<MySpacesProps> = ({
  projects,
  onOpenProject,
  onRefreshProjects,
  onNewSpace,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [activeNotesProjectId, setActiveNotesProjectId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  const roomTypes = ['All', 'Living Room', 'Bedroom', 'Dining Room', 'Study / Office', 'Balcony'];

  const filtered = projects.filter((p) => filterType === 'All' || p.roomType === filterType);

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this space project?')) {
      storage.deleteProject(projectId);
      onRefreshProjects();
    }
  };

  const handleSaveNotes = (projectId: string) => {
    const proj = storage.getProjectById(projectId);
    if (proj) {
      proj.notes = tempNotes;
      storage.saveProject(proj);
      onRefreshProjects();
      setActiveNotesProjectId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Room Projects Portfolio</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 font-display">My Spaces</h1>
          <p className="text-sm text-stone-600 mt-1">
            Manage your rooms, design variations, and decor transformation history.
          </p>
        </div>

        <button
          onClick={onNewSpace}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>New Room Space</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        {roomTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === type
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 max-w-md mx-auto">
          <FolderKanban className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No spaces in this category</h3>
          <p className="text-xs text-stone-500 mt-1">
            Start a new room transformation session to add to your spaces.
          </p>
          <button
            onClick={onNewSpace}
            className="mt-4 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold"
          >
            Create New Space
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onOpenProject(proj)}
              className="group rounded-3xl overflow-hidden border border-stone-200 bg-white hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                  <img
                    src={proj.generations?.[0]?.generatedImage || proj.originalImage}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                    {proj.roomType}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-bold">
                    {proj.generations?.length || 0} Variations
                  </span>
                </div>

                {/* Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-stone-900 group-hover:text-orange-600 transition-colors font-display">
                      {proj.name}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, proj.id)}
                      title="Delete Space"
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {proj.detectedObjects?.length || 0} objects mapped
                    </span>
                  </div>

                  {/* Notes snippet or editor */}
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    {activeNotesProjectId === proj.id ? (
                      <div onClick={(e) => e.stopPropagation()} className="space-y-2">
                        <textarea
                          rows={2}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Add design notes or measurements..."
                          className="w-full p-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-orange-500"
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setActiveNotesProjectId(null)}
                            className="px-2.5 py-1 rounded-lg text-[10px] text-stone-600"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNotes(proj.id)}
                            className="px-3 py-1 rounded-lg bg-orange-500 text-white text-[10px] font-bold"
                          >
                            Save Note
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveNotesProjectId(proj.id);
                          setTempNotes(proj.notes || '');
                        }}
                        className="flex items-center justify-between text-xs text-stone-500 hover:text-stone-800"
                      >
                        <span className="line-clamp-1 italic text-[11px]">
                          {proj.notes || '+ Click to add design notes...'}
                        </span>
                        <FileText className="w-3.5 h-3.5 text-stone-400 ml-1 flex-shrink-0" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="p-5 pt-0">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-100 hover:bg-orange-50 text-stone-800 hover:text-orange-600 text-xs font-bold transition-colors">
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Open in AI Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
