-- Users table for storing user profile information from Clerk
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Clerk user ID
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and modify their own data
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Index for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- Set up updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for budgets
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Policies for budgets
CREATE POLICY "Budgets can be viewed by owner" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Budgets can be inserted by owner" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Budgets can be updated by owner" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Budgets can be deleted by owner" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    receiptUrl TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies for expenses
CREATE POLICY "Expenses can be viewed by owner" ON public.expenses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Expenses can be inserted by owner" ON public.expenses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Expenses can be updated by owner" ON public.expenses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Expenses can be deleted by owner" ON public.expenses
    FOR DELETE USING (auth.uid() = user_id);

-- Set up updated_at trigger for budgets
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set up updated_at trigger for expenses
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Instructions:
-- 1. Go to your Supabase dashboard: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to "SQL Editor"
-- 4. Run this script to create the users table
-- 5. Your app will now be able to sync user data properly