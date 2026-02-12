import React from 'react';
import { Task, Status, Priority } from '../types';
import { CheckCircle2, Circle, Clock, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    high: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium capitalize', colors[priority])}>
      {priority}
    </span>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleStatus, onDelete, onEdit }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <CheckCircle2 size={48} className="text-gray-300" />
        </div>
        <p className="text-lg font-medium text-gray-600">No tasks found</p>
        <p className="text-sm">Create a new task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={clsx(
            "group bg-white rounded-xl border transition-all duration-200 hover:shadow-md",
            task.status === 'completed' ? 'opacity-70 border-gray-100' : 'border-gray-200 shadow-sm'
          )}
        >
          <div className="p-4 flex items-start gap-4">
            <button
              onClick={() => onToggleStatus(task.id)}
              className={clsx(
                "mt-1 flex-shrink-0 transition-colors",
                task.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-primary-500'
              )}
            >
              {task.status === 'completed' ? (
                <CheckCircle2 size={24} className="fill-current" />
              ) : (
                <Circle size={24} />
              )}
            </button>

            <div className="flex-1 min-w-0" onClick={() => onEdit(task)}>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={clsx(
                  "font-semibold text-lg truncate cursor-pointer hover:text-primary-600 transition",
                  task.status === 'completed' && 'line-through text-gray-500'
                )}>
                  {task.title}
                </h3>
                <PriorityBadge priority={task.priority} />
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-2">{task.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {task.dueDate && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{format(task.dueDate, 'MMM d, yyyy')}</span>
                  </div>
                )}
                {task.subtasks.length > 0 && (
                   <div className="flex items-center gap-1">
                     <span className="font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                       {task.subtasks.filter(t => t.completed).length}/{task.subtasks.length}
                     </span>
                     <span>subtasks</span>
                   </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onDelete(task.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
              {task.subtasks.length > 0 && (
                <button
                  onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  {expandedId === task.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              )}
            </div>
          </div>

          {/* Expanded Subtasks View */}
          {expandedId === task.id && task.subtasks.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50/50 p-4 rounded-b-xl animate-in slide-in-from-top-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Progress</p>
              <ul className="space-y-2">
                {task.subtasks.map((sub, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className={clsx(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      sub.completed ? "bg-primary-500 border-primary-500" : "border-gray-300"
                    )}>
                      {sub.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={sub.completed ? "line-through text-gray-400" : ""}>{sub.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
