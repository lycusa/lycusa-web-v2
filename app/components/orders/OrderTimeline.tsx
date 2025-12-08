"use client";

import { OrderStatusHistoryEntry, ORDER_STATUS_CONFIG, OrderStatus } from "@/app/lib/types/order";

interface OrderTimelineProps {
  history: OrderStatusHistoryEntry[];
  compact?: boolean;
}

export default function OrderTimeline({ history, compact = false }: OrderTimelineProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      full: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  };

  // Sort by date descending (most recent first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  if (sortedHistory.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-500">No status updates yet</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedHistory.map((entry, index) => {
          const config = ORDER_STATUS_CONFIG[entry.status as OrderStatus] || ORDER_STATUS_CONFIG[OrderStatus.PENDING];
          const { date, time, full } = formatDateTime(entry.updated_at);
          const isLast = index === sortedHistory.length - 1;
          const isFirst = index === 0;

          return (
            <li key={entry.id}>
              <div className="relative pb-8">
                {/* Connector line */}
                {!isLast && (
                  <span
                    className="absolute left-3 top-6 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start gap-3">
                  {/* Status dot */}
                  <div className="relative">
                    <div
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center
                        ${isFirst ? config.bgColor : "bg-gray-100"}
                        ${isFirst ? "ring-4 ring-white" : ""}
                      `}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${isFirst ? config.dotColor : "bg-gray-400"}`}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-medium ${isFirst ? config.color : "text-gray-600"}`}
                      >
                        {config.label}
                      </p>
                      {!compact && (
                        <time
                          dateTime={entry.updated_at}
                          className="text-xs text-gray-400 whitespace-nowrap"
                          title={full}
                        >
                          {date}, {time}
                        </time>
                      )}
                    </div>

                    {compact && (
                      <time
                        dateTime={entry.updated_at}
                        className="text-xs text-gray-400"
                        title={full}
                      >
                        {date}, {time}
                      </time>
                    )}

                    {entry.notes && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
