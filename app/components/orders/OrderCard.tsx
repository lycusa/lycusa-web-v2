import Link from "next/link";
import { OrderListItem, OrderStatus, ORDER_STATUS_CONFIG } from "@/app/lib/types/order";
import OrderStatusBadge from "./OrderStatusBadge";
import { useUserProfile } from "@/app/hooks/useUser";

interface OrderAvatarProps {
  userId: string;
  role: string;
}

function OrderAvatar({ userId, role }: OrderAvatarProps) {
  const { profile, loading } = useUserProfile(userId);

  // Consistent color generation based on user ID
  const getColorIndex = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 5);
  };

  const gradients = [
    'from-brand-500 to-tyrian-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-brand-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
  ];

  const gradientIndex = getColorIndex(userId);

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse border border-gray-100" />;
  }

  return (
    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center text-white border-2 border-white shadow-sm overflow-hidden`}>
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={role} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold">{profile?.username?.slice(0, 1).toUpperCase() || role.slice(0, 1)}</span>
      )}
    </div>
  );
}

interface OrderCardProps {
  order: OrderListItem;
  currentUserId: string;
}

export default function OrderCard({ order, currentUserId }: OrderCardProps) {
  const isBuyer = order.buyer_id === currentUserId;
  const roleLabel = isBuyer ? "Purchase" : "Sale";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "USD") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
    }
    return `${amount.toFixed(2)} ${currency}`;
  };

  const truncateId = (id: string) => {
    return id.slice(0, 8).toUpperCase();
  };

  const isActiveOrder = ![
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.FAILED,
    OrderStatus.REFUNDED,
  ].includes(order.status);

  return (
    <Link href={`/orders/${order.id}`} className="block group">
      <div
        className={`
          bg-white rounded-xl border transition-all duration-200
          ${isActiveOrder ? "border-gray-200 hover:border-gray-300" : "border-gray-100"}
          hover:shadow-md
        `}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {roleLabel}
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs font-mono text-gray-600">
                #{truncateId(order.id)}
              </span>
            </div>
            <OrderStatusBadge status={order.status} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start gap-4 mb-3">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              {/* We don't have the other user's ID readily available in OrderListItem without fetching.
                  However, we know if we are buyer, the other is seller, and vice versa. 
                  OrderListItem has buyer_id and seller_id. */}
              <OrderAvatar
                userId={isBuyer ? order.seller_id : order.buyer_id}
                role={isBuyer ? "Seller" : "Buyer"}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  {/* Amount */}
                  <p className="text-lg font-semibold text-gray-900 leading-tight">
                    {formatCurrency(order.total_amount, order.currency)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.items_count} {order.items_count === 1 ? "item" : "items"}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="mt-1 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 pl-[3.25rem]"> {/* Indent to align with text */}
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(order.placed_at)}
            </div>

            {order.tracking_number && order.status === OrderStatus.SHIPPED && (
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span className="font-mono">{order.tracking_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Active order indicator */}
        {isActiveOrder && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-600 ml-[3.25rem]">
              {ORDER_STATUS_CONFIG[order.status]?.description || "Processing"}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
