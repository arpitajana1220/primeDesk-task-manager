import { Edit2, Trash2, Clock } from "lucide-react";

export default function TaskCard({ task, onEdit, onDelete }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-orange-100 text-orange-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">

        <h3 className="font-semibold text-lg">
          {task.title}
        </h3>

        <div className="flex items-center gap-2">

          {/* Edit */}
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            aria-label="Edit task"
          >
            <Edit2 size={18} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            aria-label="Delete task"
          >
            <Trash2 size={18} />
          </button>

        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">
        {task.description || "No description"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">

        {/* Status & Priority */}
        <div className="flex items-center gap-2">

          <span
            className={`px-3 py-1 rounded-full text-sm ${
              statusColors[task.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {task.status?.replace("-", " ")}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-sm ${
              priorityColors[task.priority] || "bg-gray-100 text-gray-800"
            }`}
          >
            {task.priority}
          </span>

        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-sm text-gray-500">

          <Clock size={14} />

          <span>
            {task.created_at
              ? new Date(task.created_at).toLocaleDateString()
              : "—"}
          </span>

        </div>
      </div>
    </div>
  );
}
