-- Create users table for syncing Clerk user data
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster queries
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/write their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::TEXT = id);

-- Optional: Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT DEFAULT '',
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_budgets table
CREATE TABLE IF NOT EXISTS user_budgets (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  budget DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses(category);

-- Enable RLS on expenses table
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_budgets table
ALTER TABLE user_budgets ENABLE ROW LEVEL SECURITY;

-- Policies for expenses table
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Policies for user_budgets table
CREATE POLICY "Users can view their own budget" ON user_budgets
  FOR SELECT USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert their own budget" ON user_budgets
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update their own budget" ON user_budgets
  FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_budgets_updated_at BEFORE UPDATE ON user_budgets 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
