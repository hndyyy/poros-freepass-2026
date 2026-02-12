import React, { useState } from 'react';
import { Task, TaskFormData, Priority } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';

interface TaskFormProps {
  initialData?: Task;
  onSave: (data: TaskFormData, subtasks: string[]) => void;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSave, onClose }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
  );

  const [subtasks, setSubtasks] = useState<string[]>(initialData?.subtasks.map(s => s.title) || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, priority, dueDate }, subtasks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="e.g., Launch marketing campaign"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition h-24 resize-none"
                placeholder="Details about the task..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            {/* Subtasks Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtasks
              </label>
              <div className="space-y-2">
                {subtasks.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <input
                      type="text"
                      value={st}
                      onChange={(e) => {
                        const newSub = [...subtasks];
                        newSub[idx] = e.target.value;
                        setSubtasks(newSub);
                      }}
                      className="bg-transparent flex-1 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSubtasks(subtasks.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSubtasks([...subtasks, 'New subtask'])}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  <span>Add Step</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="taskForm"
            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition shadow-lg shadow-primary-500/30"
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
};
