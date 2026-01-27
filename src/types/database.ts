export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      consents: {
        Row: {
          approval_date: string | null
          auth_type: Database["public"]["Enums"]["auth_type"] | null
          created_at: string | null
          id: string
          person_id: string | null
          proof_link: string | null
          restriction_details: string | null
          restrictions: Database["public"]["Enums"]["restriction_type"][] | null
          scope: Database["public"]["Enums"]["consent_scope"]
          status: Database["public"]["Enums"]["consent_status"]
          updated_at: string | null
          usage_permissions:
            | Database["public"]["Enums"]["usage_permission_type"][]
            | null
          validator_id: string | null
          wedding_id: string | null
        }
        Insert: {
          approval_date?: string | null
          auth_type?: Database["public"]["Enums"]["auth_type"] | null
          created_at?: string | null
          id?: string
          person_id?: string | null
          proof_link?: string | null
          restriction_details?: string | null
          restrictions?:
            | Database["public"]["Enums"]["restriction_type"][]
            | null
          scope?: Database["public"]["Enums"]["consent_scope"]
          status?: Database["public"]["Enums"]["consent_status"]
          updated_at?: string | null
          usage_permissions?:
            | Database["public"]["Enums"]["usage_permission_type"][]
            | null
          validator_id?: string | null
          wedding_id?: string | null
        }
        Update: {
          approval_date?: string | null
          auth_type?: Database["public"]["Enums"]["auth_type"] | null
          created_at?: string | null
          id?: string
          person_id?: string | null
          proof_link?: string | null
          restriction_details?: string | null
          restrictions?:
            | Database["public"]["Enums"]["restriction_type"][]
            | null
          scope?: Database["public"]["Enums"]["consent_scope"]
          status?: Database["public"]["Enums"]["consent_status"]
          updated_at?: string | null
          usage_permissions?:
            | Database["public"]["Enums"]["usage_permission_type"][]
            | null
          validator_id?: string | null
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "couples"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consents_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      couples: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: string
          instagram: string | null
          name: string
          other_socials: string | null
          role: string
          tiktok: string | null
          updated_at: string | null
          wedding_id: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          name: string
          other_socials?: string | null
          role: string
          tiktok?: string | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          name?: string
          other_socials?: string | null
          role?: string
          tiktok?: string | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couples_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string
          embedding: string | null
          file_name: string
          file_path: string | null
          id: string
          metadata: Json | null
          storage_url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          embedding?: string | null
          file_name: string
          file_path?: string | null
          id?: string
          metadata?: Json | null
          storage_url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          embedding?: string | null
          file_name?: string
          file_path?: string | null
          id?: string
          metadata?: Json | null
          storage_url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      portfolio_media: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          is_hero: boolean | null
          moment: Database["public"]["Enums"]["media_moment"] | null
          publication_status:
            | Database["public"]["Enums"]["publication_status"]
            | null
          risk_flags: Database["public"]["Enums"]["risk_flag"][] | null
          tags: string[] | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["media_type"]
          updated_at: string | null
          usage_override: Database["public"]["Enums"]["usage_override"] | null
          wedding_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          is_hero?: boolean | null
          moment?: Database["public"]["Enums"]["media_moment"] | null
          publication_status?:
            | Database["public"]["Enums"]["publication_status"]
            | null
          risk_flags?: Database["public"]["Enums"]["risk_flag"][] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          updated_at?: string | null
          usage_override?: Database["public"]["Enums"]["usage_override"] | null
          wedding_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          is_hero?: boolean | null
          moment?: Database["public"]["Enums"]["media_moment"] | null
          publication_status?:
            | Database["public"]["Enums"]["publication_status"]
            | null
          risk_flags?: Database["public"]["Enums"]["risk_flag"][] | null
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          updated_at?: string | null
          usage_override?: Database["public"]["Enums"]["usage_override"] | null
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_media_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          caption: string | null
          channel: string
          created_at: string | null
          id: string
          media_id: string | null
          performance_notes: string | null
          post_link: string | null
          publish_date: string | null
          used_credits: string | null
          wedding_id: string | null
        }
        Insert: {
          caption?: string | null
          channel: string
          created_at?: string | null
          id?: string
          media_id?: string | null
          performance_notes?: string | null
          post_link?: string | null
          publish_date?: string | null
          used_credits?: string | null
          wedding_id?: string | null
        }
        Update: {
          caption?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          media_id?: string | null
          performance_notes?: string | null
          post_link?: string | null
          publish_date?: string | null
          used_credits?: string | null
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publications_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "portfolio_media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publications_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          category: Database["public"]["Enums"]["vendor_category"]
          city_country: string | null
          contact_info: string | null
          created_at: string | null
          id: string
          instagram: string | null
          name: string
          notes: string | null
          site: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["vendor_category"]
          city_country?: string | null
          contact_info?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          name: string
          notes?: string | null
          site?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["vendor_category"]
          city_country?: string | null
          contact_info?: string | null
          created_at?: string | null
          id?: string
          instagram?: string | null
          name?: string
          notes?: string | null
          site?: string | null
        }
        Relationships: []
      }
      wedding_vendors: {
        Row: {
          created_at: string | null
          custom_credit_text: string | null
          id: string
          is_mandatory_credit: boolean | null
          notes: string | null
          repost_permission:
            | Database["public"]["Enums"]["repost_permission"]
            | null
          role_in_event: string | null
          vendor_id: string | null
          wedding_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_credit_text?: string | null
          id?: string
          is_mandatory_credit?: boolean | null
          notes?: string | null
          repost_permission?:
            | Database["public"]["Enums"]["repost_permission"]
            | null
          role_in_event?: string | null
          vendor_id?: string | null
          wedding_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_credit_text?: string | null
          id?: string
          is_mandatory_credit?: boolean | null
          notes?: string | null
          repost_permission?:
            | Database["public"]["Enums"]["repost_permission"]
            | null
          role_in_event?: string | null
          vendor_id?: string | null
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_vendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wedding_vendors_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          couple_name: string
          created_at: string | null
          destination_city: string | null
          destination_country: string | null
          editorial_notes: string | null
          folder_finals: string | null
          folder_raw: string | null
          folder_selection: string | null
          id: string
          internal_owners: string[] | null
          slug: string
          status: string | null
          updated_at: string | null
          venue_name: string | null
          wedding_date: string
          wedding_type: string | null
        }
        Insert: {
          couple_name: string
          created_at?: string | null
          destination_city?: string | null
          destination_country?: string | null
          editorial_notes?: string | null
          folder_finals?: string | null
          folder_raw?: string | null
          folder_selection?: string | null
          id?: string
          internal_owners?: string[] | null
          slug: string
          status?: string | null
          updated_at?: string | null
          venue_name?: string | null
          wedding_date: string
          wedding_type?: string | null
        }
        Update: {
          couple_name?: string
          created_at?: string | null
          destination_city?: string | null
          destination_country?: string | null
          editorial_notes?: string | null
          folder_finals?: string | null
          folder_raw?: string | null
          folder_selection?: string | null
          id?: string
          internal_owners?: string[] | null
          slug?: string
          status?: string | null
          updated_at?: string | null
          venue_name?: string | null
          wedding_date?: string
          wedding_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_photos_by_embedding: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          file_name: string
          id: string
          metadata: Json
          similarity: number
          storage_url: string
        }[]
      }
    }
    Enums: {
      auth_type: "Termo assinado" | "Email/Whatsapp" | "Contrato"
      consent_scope: "Casal" | "Pessoa Específica" | "Convidados/Menores"
      consent_status:
        | "Não solicitado"
        | "Solicitado"
        | "Aprovado"
        | "Negado"
        | "Expirado"
      media_moment:
        | "Cerimônia"
        | "Festa"
        | "Making of"
        | "Decoração"
        | "Ensaio"
        | "Outro"
      media_type: "Foto" | "Vídeo" | "Reel" | "Corte"
      publication_status:
        | "Não usado"
        | "Selecionado"
        | "Postado orgânico"
        | "Ads"
        | "Portfólio"
      repost_permission: "Sim" | "Não" | "Condicional"
      restriction_type:
        | "Não marcar casal"
        | "Não citar local"
        | "Não mostrar rosto"
        | "Não mostrar crianças"
      risk_flag:
        | "Mostra rosto"
        | "Mostra criança"
        | "Mostra convidados"
        | "Conteúdo sensível"
      usage_override: "Liberado" | "Bloqueado" | "Restrito"
      usage_permission_type:
        | "Orgânico"
        | "Ads"
        | "PR"
        | "Portfólio"
        | "Materiais Comerciais"
      vendor_category:
        | "Fotografia"
        | "Vídeo"
        | "Decor"
        | "Beauty"
        | "Venue"
        | "Música"
        | "Assessoria"
        | "Buffet"
        | "Outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      auth_type: ["Termo assinado", "Email/Whatsapp", "Contrato"],
      consent_scope: ["Casal", "Pessoa Específica", "Convidados/Menores"],
      consent_status: [
        "Não solicitado",
        "Solicitado",
        "Aprovado",
        "Negado",
        "Expirado",
      ],
      media_moment: [
        "Cerimônia",
        "Festa",
        "Making of",
        "Decoração",
        "Ensaio",
        "Outro",
      ],
      media_type: ["Foto", "Vídeo", "Reel", "Corte"],
      publication_status: [
        "Não usado",
        "Selecionado",
        "Postado orgânico",
        "Ads",
        "Portfólio",
      ],
      repost_permission: ["Sim", "Não", "Condicional"],
      restriction_type: [
        "Não marcar casal",
        "Não citar local",
        "Não mostrar rosto",
        "Não mostrar crianças",
      ],
      risk_flag: [
        "Mostra rosto",
        "Mostra criança",
        "Mostra convidados",
        "Conteúdo sensível",
      ],
      usage_override: ["Liberado", "Bloqueado", "Restrito"],
      usage_permission_type: [
        "Orgânico",
        "Ads",
        "PR",
        "Portfólio",
        "Materiais Comerciais",
      ],
      vendor_category: [
        "Fotografia",
        "Vídeo",
        "Decor",
        "Beauty",
        "Venue",
        "Música",
        "Assessoria",
        "Buffet",
        "Outro",
      ],
    },
  },
} as const

