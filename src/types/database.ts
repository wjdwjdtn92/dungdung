// 이 파일은 자동 생성됩니다.
// supabase gen types typescript --local > src/types/database.ts
// Supabase 스키마 마이그레이션 후 재실행하세요.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          locale: string
          created_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          locale?: string
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          locale?: string
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cover_pin_id: string | null
          visibility: 'public' | 'private' | 'friends'
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cover_pin_id?: string | null
          visibility?: 'public' | 'private' | 'friends'
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cover_pin_id?: string | null
          visibility?: 'public' | 'private' | 'friends'
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
      }
      pins: {
        Row: {
          id: string
          trip_id: string | null
          user_id: string
          title: string
          body: string | null
          lat: number
          lng: number
          place_name: string
          place_id: string | null
          country_code: string | null
          city: string | null
          visited_at: string
          visited_tz: string | null
          visibility: 'public' | 'private' | 'friends'
          created_at: string
        }
        Insert: {
          id?: string
          trip_id?: string | null
          user_id: string
          title: string
          body?: string | null
          lat: number
          lng: number
          place_name: string
          place_id?: string | null
          country_code?: string | null
          city?: string | null
          visited_at: string
          visited_tz?: string | null
          visibility?: 'public' | 'private' | 'friends'
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string | null
          user_id?: string
          title?: string
          body?: string | null
          lat?: number
          lng?: number
          place_name?: string
          place_id?: string | null
          country_code?: string | null
          city?: string | null
          visited_at?: string
          visited_tz?: string | null
          visibility?: 'public' | 'private' | 'friends'
          created_at?: string
        }
      }
      pin_photos: {
        Row: {
          id: string
          pin_id: string
          storage_path: string
          order: number
          width: number | null
          height: number | null
          exif_lat: number | null
          exif_lng: number | null
          created_at: string
        }
        Insert: {
          id?: string
          pin_id: string
          storage_path: string
          order: number
          width?: number | null
          height?: number | null
          exif_lat?: number | null
          exif_lng?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          pin_id?: string
          storage_path?: string
          order?: number
          width?: number | null
          height?: number | null
          exif_lat?: number | null
          exif_lng?: number | null
          created_at?: string
        }
      }
      tags: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
      }
      pin_tags: {
        Row: { pin_id: string; tag_id: string }
        Insert: { pin_id: string; tag_id: string }
        Update: { pin_id?: string; tag_id?: string }
      }
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string }
        Insert: { follower_id: string; following_id: string; created_at?: string }
        Update: { follower_id?: string; following_id?: string; created_at?: string }
      }
      likes: {
        Row: { user_id: string; pin_id: string; created_at: string }
        Insert: { user_id: string; pin_id: string; created_at?: string }
        Update: { user_id?: string; pin_id?: string; created_at?: string }
      }
      comments: {
        Row: {
          id: string
          pin_id: string
          user_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          pin_id: string
          user_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          pin_id?: string
          user_id?: string
          body?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          actor_id: string
          type: 'follow' | 'like' | 'comment'
          target_pin_id: string | null
          target_comment_id: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          actor_id: string
          type: 'follow' | 'like' | 'comment'
          target_pin_id?: string | null
          target_comment_id?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          actor_id?: string
          type?: 'follow' | 'like' | 'comment'
          target_pin_id?: string | null
          target_comment_id?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      visibility: 'public' | 'private' | 'friends'
      notification_type: 'follow' | 'like' | 'comment'
    }
  }
}
