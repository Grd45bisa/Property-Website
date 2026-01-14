export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            tours: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    agent_id: string | null
                    nadir_image_url: string | null
                    nadir_enabled: boolean
                    min_pitch: number
                    logo_url: string | null
                    whatsapp_number: string | null
                    agent_email: string | null
                    music_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    agent_id?: string | null
                    nadir_image_url?: string | null
                    nadir_enabled?: boolean
                    min_pitch?: number
                    logo_url?: string | null
                    whatsapp_number?: string | null
                    agent_email?: string | null
                    music_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    agent_id?: string | null
                    nadir_image_url?: string | null
                    nadir_enabled?: boolean
                    min_pitch?: number
                    logo_url?: string | null
                    whatsapp_number?: string | null
                    agent_email?: string | null
                    music_url?: string | null
                    updated_at?: string | null
                }
            }
            rooms: {
                Row: {
                    id: string
                    created_at: string
                    tour_id: string
                    name: string
                    slug: string
                    image_url: string
                    thumbnail_url: string | null
                    sequence_order: number
                }
                Insert: {
                    id?: string
                    created_at?: string
                    tour_id: string
                    name: string
                    slug: string
                    image_url: string
                    thumbnail_url?: string | null
                    sequence_order?: number
                }
                Update: {
                    id?: string
                    created_at?: string
                    tour_id?: string
                    name?: string
                    slug?: string
                    image_url?: string
                    thumbnail_url?: string | null
                    sequence_order?: number
                }
            }
            hotspots: {
                Row: {
                    id: string
                    room_id: string
                    type: string | null
                    text: string | null
                    pitch: number
                    yaw: number
                    target_room_id: string | null
                    icon: string | null // 'info', 'door', 'arrow', etc.
                    description: string | null
                    scale: number
                    opacity: number
                    render_mode: '2d' | 'floor' | 'wall'
                    rotate_x: number
                    rotate_z: number
                    rotate_y: number
                    aspect_ratio: number
                    scale_y: number
                    blur_shape: 'circle' | 'rect' | null
                    interaction_mode: 'popup' | 'label'
                    created_at?: string
                }
                Insert: {
                    id?: string
                    room_id: string
                    type?: string | null
                    text?: string | null
                    pitch: number
                    yaw: number
                    target_room_id?: string | null
                    icon?: string | null
                    description?: string | null
                    scale?: number
                    opacity?: number
                    render_mode?: '2d' | 'floor' | 'wall'
                    rotate_x?: number
                    rotate_z?: number
                    rotate_y?: number
                    aspect_ratio?: number
                    scale_y?: number
                    blur_shape?: 'circle' | 'rect' | null
                    interaction_mode?: 'popup' | 'label'
                    created_at?: string
                }
                Update: {
                    id?: string
                    room_id?: string
                    type?: string | null
                    text?: string | null
                    pitch?: number
                    yaw?: number
                    target_room_id?: string | null
                    icon?: string | null
                    description?: string | null
                    scale?: number
                    opacity?: number
                    render_mode?: '2d' | 'floor' | 'wall'
                    rotate_x?: number
                    rotate_z?: number
                    rotate_y?: number
                    aspect_ratio?: number
                    scale_y?: number
                    blur_shape?: 'circle' | 'rect' | null
                    interaction_mode?: 'popup' | 'label'
                    created_at?: string
                }
            }
        }
    }
}
