// 이 파일은 자동 생성됩니다.
// supabase gen types typescript --local > src/types/database.ts
// Supabase 스키마 마이그레이션 후 재실행하세요.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          locale: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          locale?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          locale?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          cover_pin_id: string | null;
          visibility: Database['public']['Enums']['visibility'];
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          cover_pin_id?: string | null;
          visibility?: Database['public']['Enums']['visibility'];
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          cover_pin_id?: string | null;
          visibility?: Database['public']['Enums']['visibility'];
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trips_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trips_cover_pin_id_fkey';
            columns: ['cover_pin_id'];
            isOneToOne: false;
            referencedRelation: 'pins';
            referencedColumns: ['id'];
          },
        ];
      };
      pins: {
        Row: {
          id: string;
          trip_id: string | null;
          user_id: string;
          title: string;
          body: string | null;
          lat: number;
          lng: number;
          place_name: string;
          place_id: string | null;
          country_code: string | null;
          city: string | null;
          visited_at: string;
          visited_tz: string | null;
          visibility: Database['public']['Enums']['visibility'];
          created_at: string;
        };
        Insert: {
          id?: string;
          trip_id?: string | null;
          user_id: string;
          title: string;
          body?: string | null;
          lat: number;
          lng: number;
          place_name: string;
          place_id?: string | null;
          country_code?: string | null;
          city?: string | null;
          visited_at: string;
          visited_tz?: string | null;
          visibility?: Database['public']['Enums']['visibility'];
          created_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string | null;
          user_id?: string;
          title?: string;
          body?: string | null;
          lat?: number;
          lng?: number;
          place_name?: string;
          place_id?: string | null;
          country_code?: string | null;
          city?: string | null;
          visited_at?: string;
          visited_tz?: string | null;
          visibility?: Database['public']['Enums']['visibility'];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pins_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pins_trip_id_fkey';
            columns: ['trip_id'];
            isOneToOne: false;
            referencedRelation: 'trips';
            referencedColumns: ['id'];
          },
        ];
      };
      pin_photos: {
        Row: {
          id: string;
          pin_id: string;
          storage_path: string;
          order: number;
          width: number | null;
          height: number | null;
          exif_lat: number | null;
          exif_lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pin_id: string;
          storage_path: string;
          order: number;
          width?: number | null;
          height?: number | null;
          exif_lat?: number | null;
          exif_lng?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pin_id?: string;
          storage_path?: string;
          order?: number;
          width?: number | null;
          height?: number | null;
          exif_lat?: number | null;
          exif_lng?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pin_photos_pin_id_fkey';
            columns: ['pin_id'];
            isOneToOne: false;
            referencedRelation: 'pins';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: { id: string; name: string };
        Insert: { id?: string; name: string };
        Update: { id?: string; name?: string };
        Relationships: [];
      };
      pin_tags: {
        Row: { pin_id: string; tag_id: string };
        Insert: { pin_id: string; tag_id: string };
        Update: { pin_id?: string; tag_id?: string };
        Relationships: [
          {
            foreignKeyName: 'pin_tags_pin_id_fkey';
            columns: ['pin_id'];
            isOneToOne: false;
            referencedRelation: 'pins';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pin_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string; created_at?: string };
        Update: { follower_id?: string; following_id?: string; created_at?: string };
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey';
            columns: ['follower_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follows_following_id_fkey';
            columns: ['following_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      likes: {
        Row: { user_id: string; pin_id: string; created_at: string };
        Insert: { user_id: string; pin_id: string; created_at?: string };
        Update: { user_id?: string; pin_id?: string; created_at?: string };
        Relationships: [
          {
            foreignKeyName: 'likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'likes_pin_id_fkey';
            columns: ['pin_id'];
            isOneToOne: false;
            referencedRelation: 'pins';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          pin_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          pin_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          pin_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_pin_id_fkey';
            columns: ['pin_id'];
            isOneToOne: false;
            referencedRelation: 'pins';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          actor_id: string;
          type: Database['public']['Enums']['notification_type'];
          target_pin_id: string | null;
          target_comment_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          actor_id: string;
          type: Database['public']['Enums']['notification_type'];
          target_pin_id?: string | null;
          target_comment_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipient_id?: string;
          actor_id?: string;
          type?: Database['public']['Enums']['notification_type'];
          target_pin_id?: string | null;
          target_comment_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_target_pin_id_fkey';
            columns: ['target_pin_id'];
            isOneToOne: false;
            referencedRelation: 'pins';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_target_comment_id_fkey';
            columns: ['target_comment_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      visibility: 'public' | 'friends' | 'private';
      notification_type: 'follow' | 'like' | 'comment';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
