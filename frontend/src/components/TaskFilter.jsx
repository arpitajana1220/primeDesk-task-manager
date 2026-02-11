import { Search, Filter } from "lucide-react";

export default function TaskFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}) {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-4">

        <div className="flex flex-wrap items-center gap-4">

          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">

            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">

            <Filter size={18} className="text-gray-400" />

            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-2">

            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}
