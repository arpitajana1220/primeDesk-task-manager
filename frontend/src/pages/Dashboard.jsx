import { useState, useEffect, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

import TaskFilter from "../components/TaskFilter";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 6; // must match PAGE_SIZE in settings.py

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [loading, setLoading] = useState(false);

  const requestId = useRef(0);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  /* Debounce search, and go back to page 1 when it applies */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePriorityChange = (value) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  /* Load one page from the backend */
  const loadTasks = useCallback(async () => {
    const id = ++requestId.current; // ignore stale responses
    try {
      setLoading(true);

      const params = { page: currentPage };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (priorityFilter !== "all") params.priority = priorityFilter;

      const res = await api.get("tasks/", { params });
      if (id !== requestId.current) return;

      setTasks(res.data.results);
      setTotalCount(res.data.count);
    } catch (err) {
      if (id !== requestId.current) return;

      // Last item on the last page was deleted -> step back one page
      if (err.response?.status === 404 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
        return;
      }
      console.error("Failed to load tasks", err);
      alert("Failed to load tasks");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* CRUD */
  const handleCreateTask = async (data) => {
    try {
      await api.post("tasks/", data);
      await loadTasks();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  };

  const handleUpdateTask = async (data) => {
    if (!editingTask) return;
    try {
      await api.put(`tasks/${editingTask.id}/`, data);
      await loadTasks();
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`tasks/${id}/`);
      await loadTasks();
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbar />
      <TaskFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        priorityFilter={priorityFilter}
        onPriorityChange={handlePriorityChange}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>
            <p className="text-gray-600">
              {totalCount} {totalCount === 1 ? "task" : "tasks"} found
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus size={20} />
            <span>Create Task</span>
          </button>
        </div>

        {loading ? (
          <p className="text-center py-16 text-gray-500">Loading tasks...</p>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No tasks found. Create your first task.
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </main>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </>
  );
}