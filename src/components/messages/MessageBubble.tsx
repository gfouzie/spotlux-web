'use client';

import { useState } from 'react';
import { MessageWithSender } from '@/api/conversations';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: MessageWithSender;
  currentUserId: number;
  onEdit?: (messageId: number, content: string) => void;
  onDelete?: (messageId: number) => void;
}

const MessageBubble = ({ message, currentUserId, onEdit, onDelete }: MessageBubbleProps) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isSent = message.senderId === currentUserId;
  const isDeleted = message.isDeleted;

  // Check if message can be edited (within 15 minutes)
  const timeSinceCreation = Date.now() - new Date(message.createdAt).getTime();
  const canEdit = isSent && !isDeleted && timeSinceCreation < 15 * 60 * 1000; // 15 minutes

  // Format timestamp
  const timestamp = formatDistanceToNow(new Date(message.createdAt), {
    addSuffix: true,
  });

  // Handle edit save
  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if (trimmed && trimmed !== message.content && onEdit) {
      onEdit(message.id, trimmed);
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditContent(message.content);
    }
  };

  // Handle edit cancel
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  // Handle delete
  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className={`flex gap-2 mb-3 group ${isSent ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowDeleteConfirm(false);
      }}
    >
      {/* Avatar (only for received messages) */}
      {!isSent && (
        <div className="flex-shrink-0 self-end mb-1">
          <div className="w-8 h-8 rounded-full bg-accent-col/20 flex items-center justify-center text-sm font-medium">
            {message.sender?.firstName?.[0] || message.sender?.username?.[0] || 'U'}
          </div>
        </div>
      )}

      {/* Message content */}
      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name (only for received messages) */}
        {!isSent && (
          <div className="text-xs text-text-col/60 mb-1 px-3">
            {message.sender?.firstName && message.sender?.lastName
              ? `${message.sender.firstName} ${message.sender.lastName}`
              : message.sender?.username || 'Unknown'}
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div
            className={`px-4 py-2.5 ${
              isSent
                ? 'bg-accent-col text-white rounded-2xl rounded-br-md'
                : 'bg-card-col border border-text-col/10 rounded-2xl rounded-bl-md'
            }`}
          >
            {isEditing ? (
              // Edit mode
              <div className="min-w-[200px]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-2 py-1 bg-white text-black rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-col"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Message text */}
                <p className={`text-sm ${isDeleted ? 'italic opacity-60' : ''}`}>
                  {message.content}
                </p>

                {/* Image if present */}
                {message.imageUrl && !isDeleted && (
                  <img
                    src={message.imageUrl}
                    alt="Message attachment"
                    className="mt-2 rounded-md max-w-full h-auto"
                  />
                )}
              </>
            )}
          </div>

          {/* Action buttons (only for sent messages) */}
          {isSent && !isDeleted && !isEditing && showActions && (
            <div
              className={`absolute top-0 ${
                isSent ? 'right-full mr-2' : 'left-full ml-2'
              } flex gap-1`}
            >
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 bg-bg-col hover:bg-accent-col/20 rounded text-xs text-text-col/60 hover:text-accent-col transition-colors"
                  title="Edit message"
                >
                  ✏️
                </button>
              )}
              {showDeleteConfirm ? (
                <div className="flex gap-1 bg-bg-col rounded p-1">
                  <button
                    onClick={handleDelete}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 bg-bg-col hover:bg-red-500/20 rounded text-xs text-text-col/60 hover:text-red-500 transition-colors"
                  title="Delete message"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>

        {/* Message metadata */}
        <div className={`flex items-center gap-2 text-[10px] text-text-col/40 mt-0.5 ${isSent ? 'px-3' : 'px-3'}`}>
          <span>{timestamp}</span>
          {message.isEdited && !isDeleted && <span>• Edited</span>}
          {isSent && message.isRead && <span>• Read</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
