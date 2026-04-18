'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { createComment, deleteComment } from '@/lib/social/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/ui';

interface CommentAuthor {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export interface CommentData {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author: CommentAuthor | null;
}

interface CommentSectionProps {
  pinId: string;
  initialComments: CommentData[];
  currentUserId: string | null;
  onAuthorClick?: (username: string) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export function CommentSection({
  pinId,
  initialComments,
  currentUserId,
  onAuthorClick,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const openLoginModal = useUIStore((s) => s.openLoginModal);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setBody('');
    startTransition(async () => {
      try {
        const result = await createComment(pinId, trimmed);
        const newComment: CommentData = {
          id: result.id,
          body: result.body,
          created_at: result.created_at,
          user_id: result.user_id,
          author: result.users as CommentAuthor | null,
        };
        setComments((prev) => [...prev, newComment]);
      } catch {
        setBody(trimmed);
      }
    });
  }

  function handleDelete(commentId: string) {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    startTransition(async () => {
      try {
        await deleteComment(commentId);
      } catch {
        // 삭제 실패 시 복원 — 간단히 새로고침 유도
      }
    });
  }

  const canDelete = (comment: CommentData) =>
    currentUserId === comment.user_id;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-700">댓글 {comments.length > 0 && comments.length}</h3>

      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => {
            const username = comment.author?.username;
            return (
              <div key={comment.id} className="flex gap-2.5 group">
                {/* 아바타 — 클릭 시 유저 프로필 */}
                {username ? (
                  onAuthorClick ? (
                    <button onClick={() => onAuthorClick(username)} className="shrink-0 mt-0.5 cursor-pointer">
                      <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden">
                        {comment.author?.avatar_url && (
                          <Image src={comment.author.avatar_url} alt={comment.author.display_name} width={28} height={28} />
                        )}
                      </div>
                    </button>
                  ) : (
                    <Link href={`/?user=${username}`} className="shrink-0 mt-0.5 cursor-pointer">
                      <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden">
                        {comment.author?.avatar_url && (
                          <Image src={comment.author.avatar_url} alt={comment.author.display_name} width={28} height={28} />
                        )}
                      </div>
                    </Link>
                  )
                ) : (
                  <div className="h-7 w-7 rounded-full bg-zinc-200 overflow-hidden shrink-0 mt-0.5" />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    {username ? (
                      onAuthorClick ? (
                        <button onClick={() => onAuthorClick(username)} className="text-sm font-medium text-zinc-800 cursor-pointer hover:underline">
                          {comment.author?.display_name ?? '알 수 없음'}
                        </button>
                      ) : (
                        <Link href={`/?user=${username}`} className="text-sm font-medium text-zinc-800 cursor-pointer hover:underline">
                          {comment.author?.display_name ?? '알 수 없음'}
                        </Link>
                      )
                    ) : (
                      <span className="text-sm font-medium text-zinc-800">{comment.author?.display_name ?? '알 수 없음'}</span>
                    )}
                    <span className="text-xs text-zinc-400">{timeAgo(comment.created_at)}</span>
                    {canDelete(comment) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all ml-auto cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed">{comment.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="댓글을 남겨보세요"
            maxLength={1000}
            className="flex-1"
          />
          <Button type="submit" size="icon" variant="ghost" disabled={isPending || !body.trim()}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      ) : (
        <button
          onClick={openLoginModal}
          className="w-full py-2.5 text-sm text-zinc-400 border border-dashed border-zinc-200 rounded-lg hover:border-zinc-300 hover:text-zinc-500 transition-colors"
        >
          로그인하고 댓글 달기
        </button>
      )}
    </div>
  );
}
