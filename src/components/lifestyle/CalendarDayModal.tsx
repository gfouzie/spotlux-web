"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import LoadingState from "@/components/common/LoadingState";
import Alert from "@/components/common/Alert";
import { lifestyleApi, type CalendarDate, type LifestyleDailyAggregate } from "@/api/lifestyle";
import LifestyleFeedPost from "./LifestyleFeedPost";

interface CalendarDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: CalendarDate | null;
}

const CalendarDayModal = ({
  isOpen,
  onClose,
  selectedDate,
}: CalendarDayModalProps) => {
  const [aggregate, setAggregate] = useState<LifestyleDailyAggregate | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch aggregate data when modal opens
  useEffect(() => {
    if (!isOpen || !selectedDate || !selectedDate.aggregateId) {
      setAggregate(null);
      setError(null);
      return;
    }

    const fetchAggregate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await lifestyleApi.getAggregate(selectedDate.aggregateId!);
        setAggregate(data);
      } catch (err) {
        console.error("Failed to fetch aggregate:", err);
        setError("Failed to load day details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAggregate();
  }, [isOpen, selectedDate]);

  if (!selectedDate) {
    return null;
  }

  // Format date for display (parse without timezone conversion)
  const [year, month, day] = selectedDate.dayDate.split("-").map(Number);
  const localDate = new Date(year, month - 1, day); // Create local date
  const formattedDate = localDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formattedDate}
      size="lg"
      showFooter={false}
    >
      <div className="space-y-4">
        {/* Post count header */}
        <div className="text-sm text-text-col/60">
          {selectedDate.postCount} {selectedDate.postCount === 1 ? "post" : "posts"}
        </div>

        {/* Loading state */}
        {isLoading && <LoadingState message="Loading posts..." />}

        {/* Error state */}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Posts list */}
        {aggregate && aggregate.posts && aggregate.posts.length > 0 && (
          <div className="space-y-3">
            {aggregate.posts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-bg-col/30 rounded-lg border border-text-col/10"
              >
                <LifestyleFeedPost post={post} showPromptName />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {aggregate && aggregate.posts.length === 0 && (
          <div className="text-center py-8 text-text-col/60">
            No posts for this day
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CalendarDayModal;
