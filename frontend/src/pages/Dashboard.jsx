import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

import TaskFilter from "../components/TaskFilter";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 6;

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [loading, setLoading] = useState(false);

  /* =========================
     Load Tasks from Backend
     ========================= */
  const loadTasks = async () => {
    try {
      setLoading(true);

      const res = await api.get("tasks/");
      setTasks(res.data);

    } catch (err) {
      console.error("Failed to load tasks", err);
      alert("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  /* =========================
     Filters
     ========================= */
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  /* =========================
     Pagination
     ========================= */
  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTasks, currentPage]);

  /* Reset page on filter */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  /* =========================
     CRUD
     ========================= */

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

  /* =========================
     Render
     ========================= */

  return (
    <>
      <Navbar />
      <TaskFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      <main className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>

            <p className="text-gray-600">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"} found
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

        {/* Content */}
        {loading ? (
          <p className="text-center py-16 text-gray-500">
            Loading tasks...
          </p>
        ) : paginatedTasks.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedTasks.map((task) => (
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

        {/* Pagination */}
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

      {/* Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </>
  );
}
