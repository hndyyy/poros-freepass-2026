import React, { useEffect, useState } from 'react';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { LoginForm } from './components/LoginForm';
import { SignUp } from './components/SignUp';
import { getTasks, saveTask, deleteTask } from './services/taskService';
import { getCurrentUser, logout } from './services/authService';
import { Task, TaskFormData, FilterType, User } from './types';
import { Plus, Layout, ListFilter, Search, LogOut, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const [isSignUp, setIsSignUp] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setIsLoading(false); // If no user, stop loading to show login form
    }
  }, []);

  // Load tasks whenever the user changes (and is logged in)
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setTasks([]);
  };

  const handleSaveTask = async (formData: TaskFormData, subtaskTitles: string[]) => {
    const newTask: Task = {
      id: editingTask ? editingTask.id : crypto.randomUUID(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: editingTask ? editingTask.status : 'todo',
      createdAt: editingTask ? editingTask.createdAt : Date.now(),
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
      subtasks: subtaskTitles.map((t, i) => ({
        id: crypto.randomUUID(),
        title: t,
        completed: editingTask?.subtasks[i]?.completed || false
      }))
    };

    await saveTask(newTask);
    await loadTasks();
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
      await loadTasks();
    }
  };

  const handleToggleStatus = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const updatedTask: Task = {
        ...task,
        status: task.status === 'completed' ? 'todo' : 'completed'
      };
      await saveTask(updatedTask);
      await loadTasks();
    }
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  // Filter Logic
  const filteredTasks = tasks
    .filter(t => {
      if (filter === 'todo') return t.status !== 'completed';
      if (filter === 'completed') return t.status === 'completed';
      return true;
    })
    .filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Sort: Completed at bottom, then High Priority first
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      const pMap = { high: 3, medium: 2, low: 1 };
      return pMap[b.priority] - pMap[a.priority];
    });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length
  };

  if (!user) {
    if (isSignUp) {
      return <SignUp onSignUpSuccess={handleLoginSuccess} onSwitchToLogin={() => setIsSignUp(false)} />;
    }
    return <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignUp={() => setIsSignUp(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Layout size={20} className="text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">TaskFlow</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex text-sm font-medium text-gray-500 gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {stats.pending} Pending
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {stats.completed} Done
              </span>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                <UserIcon size={16} className="text-gray-500" />
                <span className="truncate max-w-[100px]">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex-1 sm:flex-none justify-center">
              {(['all', 'todo', 'completed'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize",
                    filter === f
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 sm:hidden"
            >
              <Plus size={24} />
            </button>

            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium transition hidden sm:flex items-center gap-2 shadow-lg shadow-primary-500/20"
            >
              <Plus size={18} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading tasks...</p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteTask}
            onEdit={handleOpenEdit}
          />
        )}
      </main>

      {/* Modal */}
      {isFormOpen && (
        <TaskForm
          onClose={handleCloseForm}
          onSave={handleSaveTask}
          initialData={editingTask}
        />
      )}
    </div>
  );
}

export default App;
