import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  /* =========================
     Visible Pages Logic
     ========================= */
  const getVisiblePages = () => {
    if (totalPages <= 5) return pages;

    if (currentPage <= 3) return pages.slice(0, 5);

    if (currentPage >= totalPages - 2)
      return pages.slice(totalPages - 5);

    return pages.slice(currentPage - 3, currentPage + 2);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-2">

      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>

      {/* First Page */}
      {visiblePages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            1
          </button>

          {visiblePages[0] > 2 && (
            <span className="px-2">...</span>
          )}
        </>
      )}

      {/* Pages */}
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 border rounded-lg ${
            currentPage === page
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last Page */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2">...</span>
          )}

          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>

    </div>
  );
}
