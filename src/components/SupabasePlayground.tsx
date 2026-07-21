import React, { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { Database, ShieldAlert, Sparkles, Plus, Check, RefreshCw, Terminal, ArrowRight, Code } from "lucide-react";

export default function SupabasePlayground() {
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodoName, setNewTodoName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<"demo" | "sql" | "snippets">("demo");

  // Local state for env values (for display/diagnostics)
  const isEnvConfigured = 
    (import.meta as any).env?.VITE_SUPABASE_URL && 
    (import.meta as any).env?.VITE_SUPABASE_URL !== "https://your-project.supabase.co" &&
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY &&
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY !== "your-anon-key";

  // Initialize Supabase if variables are set
  const getSupabase = () => {
    try {
      if (!isEnvConfigured) return null;
      return createClient();
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      return null;
    }
  };

  const fetchTodos = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      // In mock mode if not configured
      setStatus("idle");
      return;
    }

    setIsLoading(true);
    setStatus("connecting");
    try {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setTodos(data || []);
      setStatus("success");
      setErrorMessage("");
    } catch (err: any) {
      console.error("Supabase query error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Could not fetch data from 'todos' table. Please ensure the table exists.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEnvConfigured) {
      fetchTodos();
    } else {
      // Populate with some beautiful mock data if Supabase is not connected yet
      setTodos([
        { id: 1, name: "Set up Supabase project in console 🚀", is_completed: true, created_at: new Date().toISOString() },
        { id: 2, name: "Configure environment variables in Secrets panel 🔑", is_completed: false, created_at: new Date().toISOString() },
        { id: 3, name: "Execute the SQL schema to create the 'todos' table 📊", is_completed: false, created_at: new Date().toISOString() },
      ]);
    }
  }, [isEnvConfigured]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoName.trim()) return;

    const supabase = getSupabase();
    if (!supabase) {
      // Add local mock todo
      const newMockTodo = {
        id: Date.now(),
        name: newTodoName,
        is_completed: false,
        created_at: new Date().toISOString()
      };
      setTodos([newMockTodo, ...todos]);
      setNewTodoName("");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("todos")
        .insert([{ name: newTodoName, is_completed: false }])
        .select();

      if (error) throw error;
      if (data) {
        setTodos([data[0], ...todos]);
      }
      setNewTodoName("");
    } catch (err: any) {
      alert(`Error inserting todo: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTodo = async (id: any, currentStatus: boolean) => {
    const supabase = getSupabase();
    if (!supabase) {
      // Toggle local mock todo
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
      return;
    }

    try {
      const { error } = await supabase
        .from("todos")
        .update({ is_completed: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setTodos(todos.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    } catch (err: any) {
      alert(`Error updating todo: ${err.message}`);
    }
  };

  const handleDeleteTodo = async (id: any) => {
    const supabase = getSupabase();
    if (!supabase) {
      // Delete local mock todo
      setTodos(todos.filter(t => t.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setTodos(todos.filter(t => t.id !== id));
    } catch (err: any) {
      alert(`Error deleting todo: ${err.message}`);
    }
  };

  return (
    <div className="bg-[#12110f] text-white p-6 md:p-8 rounded-2xl border border-brand-umber/30 shadow-2xl relative overflow-hidden max-w-4xl mx-auto my-8">
      {/* Absolute Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-umber/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-umber/20 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-umber/20 rounded-xl border border-brand-gold/30">
            <Database className="w-8 h-8 text-brand-gold" />
          </div>
          <div>
            <h2 className="font-serif text-2xl tracking-wider text-brand-gold">
              Supabase Playground &amp; Diagnostics
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-1">
              Active Environment: React (Vite) + Express Full-Stack
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-gray-400">Connection Status:</span>
          {isEnvConfigured ? (
            status === "success" ? (
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                CONNECTED / متصل
              </span>
            ) : status === "connecting" ? (
              <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                CONNECTING...
              </span>
            ) : (
              <span className="bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-1.5 font-semibold">
                <ShieldAlert className="w-3 h-3" />
                TABLE ERROR
              </span>
            )
          ) : (
            <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3 h-3" />
              DEMO MODE
            </span>
          )}
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-brand-umber/20 mb-6 gap-2">
        <button
          onClick={() => setActiveSubTab("demo")}
          className={`px-4 py-2 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
            activeSubTab === "demo"
              ? "border-brand-gold text-brand-gold font-bold"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          ⚡ Live Todo Database Demo
        </button>
        <button
          onClick={() => setActiveSubTab("sql")}
          className={`px-4 py-2 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
            activeSubTab === "sql"
              ? "border-brand-gold text-brand-gold font-bold"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          📋 SQL Database Schema
        </button>
        <button
          onClick={() => setActiveSubTab("snippets")}
          className={`px-4 py-2 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
            activeSubTab === "snippets"
              ? "border-brand-gold text-brand-gold font-bold"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          💻 Client &amp; Server Snippets
        </button>
      </div>

      {/* Tab Contents: Demo */}
      {activeSubTab === "demo" && (
        <div className="space-y-6">
          {!isEnvConfigured && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs leading-relaxed font-mono flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-1">🔑 Demo Mode - Credentials Required</strong>
                To connect to your live database, configure the environment variables inside your AI Studio **Secrets** panel:
                <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-300">
                  <li><code className="text-amber-200 bg-black/30 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code></li>
                  <li><code className="text-amber-200 bg-black/30 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code></li>
                </ul>
                <p className="mt-2 text-gray-400">Showing local sandbox preview. Any additions here will be saved in temporary memory.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-200 text-xs font-mono flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
              <div>
                <strong className="text-rose-300 block mb-1">❌ Query Error details</strong>
                {errorMessage}
                <p className="mt-2 text-gray-300">
                  This happens if your credentials are set but you haven't run the SQL schema yet. Click the <span className="text-brand-gold font-bold">SQL Database Schema</span> tab to copy the table creation script.
                </p>
              </div>
            </div>
          )}

          {/* Interactive Form */}
          <form onSubmit={handleAddTodo} className="flex gap-3">
            <input
              type="text"
              value={newTodoName}
              onChange={(e) => setNewTodoName(e.target.value)}
              placeholder="e.g. Design beautiful responsive landing page..."
              className="flex-1 bg-black/40 border border-brand-umber/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-gold placeholder-gray-500 font-mono text-white transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !newTodoName.trim()}
              className="bg-brand-gold text-black font-semibold text-xs px-6 py-3 rounded-xl hover:bg-brand-gold/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </form>

          {/* Todo List Render */}
          <div className="bg-black/20 border border-brand-umber/15 rounded-xl overflow-hidden font-mono text-sm divide-y divide-brand-umber/10">
            {todos.length > 0 ? (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-4 hover:bg-brand-umber/5 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        todo.is_completed
                          ? "bg-brand-gold border-brand-gold text-black"
                          : "border-brand-umber/40 hover:border-brand-gold"
                      }`}
                    >
                      {todo.is_completed && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </button>
                    <span
                      className={`truncate text-xs ${
                        todo.is_completed ? "line-through text-gray-500" : "text-gray-200"
                      }`}
                    >
                      {todo.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-500 hidden sm:inline">
                      {new Date(todo.created_at).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500 text-xs">
                Your 'todos' list is empty. Add a task above to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: SQL Schema */}
      {activeSubTab === "sql" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-xl text-gray-300 leading-relaxed">
            <h4 className="font-serif text-brand-gold text-sm font-semibold mb-2">
              ⚜️ Full Boutique Database Migration Script
            </h4>
            <p className="mb-2">
              We have generated the complete schema script in <strong>/supabase_schema.sql</strong> at the root of your project workspace. 
              This creates all 11 tables (<code className="text-brand-gold">categories</code>, <code className="text-brand-gold">products</code>, <code className="text-brand-gold">product_images</code>, <code className="text-brand-gold">users</code>, <code className="text-brand-gold">cart</code>, <code className="text-brand-gold">wishlist</code>, <code className="text-brand-gold">orders</code>, <code className="text-brand-gold">order_items</code>, etc.), RLS policies, storage buckets for product assets, and auto-sync triggers for auth sign-ups.
            </p>
            <p>
              Go to your <strong>Supabase Dashboard → SQL Editor</strong>, click "New Query", paste the copied script, and click <strong>Run</strong>.
            </p>
          </div>

          <div className="bg-black/60 border border-brand-umber/25 rounded-xl p-4 relative group">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-brand-umber/10 text-gray-400 text-[10px]">
              <span>PREVIEW OF /supabase_schema.sql</span>
              <span className="text-emerald-500 font-bold">11 TABLES + BUCKETS + TRIGGERS</span>
            </div>
            <pre className="text-emerald-400 overflow-x-auto leading-relaxed max-h-72 select-all">
{`-- Create categories table
create table public.categories (
    id text primary key,
    name text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table (referencing categories)
create table public.products (
    id text primary key,
    name text not null,
    category_id text references public.categories(id) on delete set null,
    category_name text,
    price numeric not null,
    image text not null,
    secondary_images text[] default '{}'::text[],
    description text default '',
    tagline text default '',
    is_new boolean default false not null,
    material_options text[] default '{}'::text[],
    size_options text[] default '{}'::text[],
    details text[] default '{}'::text[],
    craftsmanship text default '',
    stock integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users profile (automatically synced via trigger)
create table public.users (
    id uuid primary key,
    name text not null,
    email text not null,
    avatar text,
    tier text default 'Bronze',
    loyalty_points integer default 0 not null,
    total_spent numeric default 0.0 not null,
    joined_date text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ... Plus 'product_images', 'cart', 'wishlist', 'orders',
-- 'order_items', 'reviews', 'coupons', and 'loyalty_points' tables.
-- Click Copy to get the complete script!`}
            </pre>
            <button
              onClick={() => {
                const fullSql = `-- =========================================================================
-- VERO BOUTIQUE SUPABASE DATABASE MIGRATION SCRIPT
-- =========================================================================
-- This script creates all required tables, foreign keys, indexes, triggers,
-- Row Level Security (RLS) policies, and public storage buckets for product images.
-- Paste this entire script into your Supabase SQL Editor and click 'Run'.

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id text PRIMARY KEY,
    name text NOT NULL,
    category_id text REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name text,
    price numeric NOT NULL,
    image text NOT NULL,
    secondary_images text[] DEFAULT '{}'::text[],
    description text DEFAULT '',
    tagline text DEFAULT '',
    is_new boolean DEFAULT false NOT NULL,
    material_options text[] DEFAULT '{}'::text[],
    size_options text[] DEFAULT '{}'::text[],
    details text[] DEFAULT '{}'::text[],
    craftsmanship text DEFAULT '',
    stock integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create product_images table
CREATE TABLE IF NOT EXISTS public.product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id text REFERENCES public.products(id) ON DELETE CASCADE,
    image_url text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create users table (public profile mapped to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY, -- references auth.users(id)
    name text NOT NULL,
    email text NOT NULL,
    avatar text,
    provider text DEFAULT 'email',
    tier text DEFAULT 'Bronze',
    loyalty_points integer DEFAULT 0 NOT NULL,
    total_spent numeric DEFAULT 0.0 NOT NULL,
    joined_date text,
    redeemed_rewards text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
    id text PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    product_id text REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer DEFAULT 1 NOT NULL,
    selected_material text,
    selected_size text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    product_id text REFERENCES public.products(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id)
);

-- 7. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id text PRIMARY KEY,
    order_number text NOT NULL UNIQUE,
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    email text NOT NULL,
    shipping_name text NOT NULL,
    shipping_address text NOT NULL,
    shipping_city text NOT NULL,
    shipping_zip text DEFAULT '',
    shipping_phone text DEFAULT '',
    total numeric NOT NULL,
    status text NOT NULL,
    date text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id text REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id text REFERENCES public.products(id) ON DELETE SET NULL,
    quantity integer DEFAULT 1 NOT NULL,
    selected_material text,
    selected_size text,
    price numeric NOT NULL
);

-- 9. Create loyalty_points table
CREATE TABLE IF NOT EXISTS public.loyalty_points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    points integer NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id text REFERENCES public.products(id) ON DELETE CASCADE,
    author text NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text DEFAULT '',
    date text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    code text PRIMARY KEY,
    discount numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user ON public.loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated permissive policies for effortless client operations
CREATE POLICY "Allow public select categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete categories" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Allow public select products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public select product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Allow public insert product_images" ON public.product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update product_images" ON public.product_images FOR UPDATE USING (true);
CREATE POLICY "Allow public delete product_images" ON public.product_images FOR DELETE USING (true);

CREATE POLICY "Allow public select users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Allow public select cart" ON public.cart FOR SELECT USING (true);
CREATE POLICY "Allow public insert cart" ON public.cart FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update cart" ON public.cart FOR UPDATE USING (true);
CREATE POLICY "Allow public delete cart" ON public.cart FOR DELETE USING (true);

CREATE POLICY "Allow public select wishlist" ON public.wishlist FOR SELECT USING (true);
CREATE POLICY "Allow public insert wishlist" ON public.wishlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update wishlist" ON public.wishlist FOR UPDATE USING (true);
CREATE POLICY "Allow public delete wishlist" ON public.wishlist FOR DELETE USING (true);

CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public select order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update order_items" ON public.order_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete order_items" ON public.order_items FOR DELETE USING (true);

CREATE POLICY "Allow public select loyalty_points" ON public.loyalty_points FOR SELECT USING (true);
CREATE POLICY "Allow public insert loyalty_points" ON public.loyalty_points FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update loyalty_points" ON public.loyalty_points FOR UPDATE USING (true);
CREATE POLICY "Allow public delete loyalty_points" ON public.loyalty_points FOR DELETE USING (true);

CREATE POLICY "Allow public select reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert reviews" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update reviews" ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Allow public delete reviews" ON public.reviews FOR DELETE USING (true);

CREATE POLICY "Allow public select coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Allow public insert coupons" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update coupons" ON public.coupons FOR UPDATE USING (true);
CREATE POLICY "Allow public delete coupons" ON public.coupons FOR DELETE USING (true);

-- Insert public storage bucket for product assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-assets', 'product-assets', true) 
ON CONFLICT (id) DO NOTHING;

-- Policies for public storage bucket access
CREATE POLICY "Allow public select storage" ON storage.objects FOR SELECT USING (bucket_id = 'product-assets');
CREATE POLICY "Allow public insert storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-assets');
CREATE POLICY "Allow public update storage" ON storage.objects FOR UPDATE USING (bucket_id = 'product-assets');
CREATE POLICY "Allow public delete storage" ON storage.objects FOR DELETE USING (bucket_id = 'product-assets');

-- This automatically inserts a corresponding profile row in public.users when a user signs up via auth.signUp
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, avatar, provider, tier, loyalty_points, total_spent, joined_date, redeemed_rewards)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new.id),
    'email',
    'Bronze',
    0,
    0.0,
    to_char(now(), 'YYYY-MM-DD'),
    '{}'::text[]
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed initial categories
INSERT INTO public.categories (id, name) VALUES
('html', 'HTML'),
('react', 'React'),
('css', 'CSS'),
('python-django', 'Python-Django'),
('rings', 'Rings'),
('necklaces', 'Necklaces'),
('bracelets', 'Bracelets')
ON CONFLICT (id) DO NOTHING;
`;
                navigator.clipboard.writeText(fullSql);
                alert("Complete Luxury Boutique SQL Schema copied to clipboard!");
              }}
              className="absolute top-3 right-3 bg-brand-gold/10 hover:bg-brand-gold/25 border border-brand-gold/35 text-brand-gold px-3 py-1.5 rounded-lg text-[10px] transition-all"
            >
              Copy SQL Script
            </button>
          </div>
        </div>
      )}

      {/* Tab Contents: Snippets */}
      {activeSubTab === "snippets" && (
        <div className="space-y-4">
          <p className="text-xs text-gray-400 font-mono leading-relaxed">
            Below are snippets showing how to initialize and consume Supabase in your client views or Express server endpoints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client-side Snippet */}
            <div className="bg-black/30 border border-brand-umber/15 rounded-xl p-4 font-mono text-[11px] space-y-2">
              <div className="flex items-center gap-2 text-brand-gold border-b border-brand-umber/10 pb-2 mb-2 font-bold text-xs">
                <Code className="w-3.5 h-3.5" /> Frontend (React Vite)
              </div>
              <pre className="text-gray-300 overflow-x-auto">
{`import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

// Fetching in a useEffect or handler
const loadData = async () => {
  const { data, error } = await supabase
    .from("todos")
    .select("*");
    
  if (data) console.log(data);
};`}
              </pre>
            </div>

            {/* Server-side Snippet */}
            <div className="bg-black/30 border border-brand-umber/15 rounded-xl p-4 font-mono text-[11px] space-y-2">
              <div className="flex items-center gap-2 text-brand-gold border-b border-brand-umber/10 pb-2 mb-2 font-bold text-xs">
                <Terminal className="w-3.5 h-3.5" /> Backend (Express Route)
              </div>
              <pre className="text-gray-300 overflow-x-auto">
{`import { createExpressClient } from "@/utils/supabase/server";

app.get("/api/todos", async (req, res) => {
  const supabase = createExpressClient(req, res);
  
  const { data, error } = await supabase
    .from("todos")
    .select("*");
    
  res.json(data || []);
});`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
