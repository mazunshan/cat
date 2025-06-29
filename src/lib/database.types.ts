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
      users: {
        Row: {
          id: string
          username: string
          email: string
          role: string
          name: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          role?: string
          name: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: string
          name?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          gender: string
          phone: string
          wechat: string
          address: string
          occupation: string
          tags: string[]
          notes: string
          assigned_sales: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          gender?: string
          phone: string
          wechat?: string
          address?: string
          occupation?: string
          tags?: string[]
          notes?: string
          assigned_sales: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          gender?: string
          phone?: string
          wechat?: string
          address?: string
          occupation?: string
          tags?: string[]
          notes?: string
          assigned_sales?: string
          created_at?: string
          updated_at?: string
        }
      }
      customer_files: {
        Row: {
          id: string
          customer_id: string
          name: string
          type: string
          url: string
          description: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          name: string
          type: string
          url: string
          description?: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          name?: string
          type?: string
          url?: string
          description?: string
          uploaded_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          breed: string
          age: string
          gender: string
          price: number
          description: string
          images: string[]
          videos: string[]
          is_available: boolean
          features: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          breed: string
          age: string
          gender?: string
          price: number
          description?: string
          images?: string[]
          videos?: string[]
          is_available?: boolean
          features?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          breed?: string
          age?: string
          gender?: string
          price?: number
          description?: string
          images?: string[]
          videos?: string[]
          is_available?: boolean
          features?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          order_number: string
          amount: number
          payment_method: string
          status: string
          order_date: string
          sales_person: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          order_number: string
          amount: number
          payment_method?: string
          status?: string
          order_date?: string
          sales_person: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          order_number?: string
          amount?: number
          payment_method?: string
          status?: string
          order_date?: string
          sales_person?: string
          created_at?: string
          updated_at?: string
        }
      }
      order_products: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
      }
      installment_plans: {
        Row: {
          id: string
          order_id: string
          total_installments: number
          installment_amount: number
          paid_installments: number
          next_payment_date: string
        }
        Insert: {
          id?: string
          order_id: string
          total_installments: number
          installment_amount: number
          paid_installments?: number
          next_payment_date: string
        }
        Update: {
          id?: string
          order_id?: string
          total_installments?: number
          installment_amount?: number
          paid_installments?: number
          next_payment_date?: string
        }
      }
      payments: {
        Row: {
          id: string
          installment_plan_id: string
          installment_number: number
          amount: number
          due_date: string
          paid_date: string | null
          status: string
        }
        Insert: {
          id?: string
          installment_plan_id: string
          installment_number: number
          amount: number
          due_date: string
          paid_date?: string | null
          status?: string
        }
        Update: {
          id?: string
          installment_plan_id?: string
          installment_number?: number
          amount?: number
          due_date?: string
          paid_date?: string | null
          status?: string
        }
      }
      knowledge_base: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          tags: string[]
          images: string[]
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category: string
          tags?: string[]
          images?: string[]
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string
          tags?: string[]
          images?: string[]
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}