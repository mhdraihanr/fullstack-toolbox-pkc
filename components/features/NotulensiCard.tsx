import React from "react";
import {
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Notulensi, Meeting, User as UserType, ActionItem } from "../../types";

interface NotulensiCardProps {
  notulensi: Notulensi & {
    meeting?: Meeting;
    creator?: UserType;
    approver?: UserType;
    action_items?: (ActionItem & { assignee?: UserType })[];
  };
  onViewDetail?: (notulensi: NotulensiCardProps["notulensi"]) => void;
}

export function NotulensiCard({ notulensi, onViewDetail }: NotulensiCardProps) {
  const getApprovalStatus = () => {
    if (notulensi.approved_at) {
      return {
        label: "Approved",
        status: "completed" as const,
        color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        icon: CheckCircle,
      };
    }
    return {
      label: "Pending Approval",
      status: "pending" as const,
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      icon: AlertTriangle,
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Baru saja";
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} hari yang lalu`;
      } else {
        return formatDate(dateString);
      }
    }
  };

  const approvalStatus = getApprovalStatus();
  const StatusIcon = approvalStatus.icon;
  const completedActionItems = notulensi.action_items?.filter(item => item.status === "completed").length || 0;
  const totalActionItems = notulensi.action_items?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {notulensi.meeting?.title || "Rapat Tidak Diketahui"}
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {notulensi.content.substring(0, 120)}...
            </p>
          </div>
          <Badge status={approvalStatus.status} className={approvalStatus.color}>
            {approvalStatus.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Meeting Info */}
        {notulensi.meeting && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(notulensi.meeting.date_time)}</span>
            <span className="text-gray-400">•</span>
            <span>{notulensi.meeting.duration} menit</span>
          </div>
        )}

        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Dibuat oleh:</span>
          <div className="flex items-center gap-2">
            <Avatar
              src={notulensi.creator?.avatar_url}
              alt={notulensi.creator?.name || "Unknown"}
              fallback={notulensi.creator?.name?.charAt(0) || "?"}
              size="xs"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {notulensi.creator?.name || "Unknown"}
            </span>
          </div>
        </div>

        {/* Approval Info */}
        {notulensi.approved_at && notulensi.approver && (
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Disetujui oleh:</span>
            <div className="flex items-center gap-2">
              <Avatar
                src={notulensi.approver.avatar_url}
                alt={notulensi.approver.name}
                fallback={notulensi.approver.name.charAt(0)}
                size="xs"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {notulensi.approver.name}
              </span>
            </div>
          </div>
        )}

        {/* Action Items Summary */}
        {totalActionItems > 0 && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Action Items:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {completedActionItems}/{totalActionItems} completed
            </span>
            {completedActionItems === totalActionItems && totalActionItems > 0 && (
              <Badge status="completed" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs">
                All Completed
              </Badge>
            )}
          </div>
        )}

        {/* Decisions Count */}
        {notulensi.decisions && notulensi.decisions.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {notulensi.decisions.length} keputusan rapat
            </span>
          </div>
        )}

        {/* Next Meeting */}
        {notulensi.next_meeting_date && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Rapat selanjutnya:
            </span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {formatDate(notulensi.next_meeting_date)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(notulensi.created_at)}</span>
          </div>
          
          {onViewDetail && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetail(notulensi)}
              className="flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              Detail
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default NotulensiCard;