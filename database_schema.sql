
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro', 'premium')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned')),
    daily_usage INTEGER DEFAULT 0,
    usage_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(email)
);

-- AI Models table
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    headers JSONB DEFAULT '{}',
    body_template TEXT NOT NULL,
    model_type TEXT NOT NULL CHECK (model_type IN ('transcription', 'analysis')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    price DECIMAL(10,2) DEFAULT 0,
    daily_limit INTEGER NOT NULL,
    features JSONB DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transcription history table
CREATE TABLE IF NOT EXISTS transcription_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    transcription_text TEXT,
    analysis_result JSONB,
    confidence_score DECIMAL(5,2),
    language TEXT DEFAULT 'en',
    duration DECIMAL(10,2),
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('transcription', 'analysis')),
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing plans
INSERT INTO pricing_plans (name, price, daily_limit, features) VALUES
('Free', 0, 1, '["1 transcript per day", "Basic support"]'),
('Basic', 1, 5, '["5 transcripts per day", "Email support"]'),
('Pro', 2, 10, '["10 transcripts per day", "Priority support", "Analysis features"]'),
('Premium', 3, 20, '["20 transcripts per day", "Premium support", "All features", "Priority processing"]')
ON CONFLICT (name) DO NOTHING;

-- Insert default contact info
INSERT INTO admin_settings (key, value) VALUES
('contact_info', '{"email": "legendgamerz9999@gmail.com", "whatsapp": "", "payment_instructions": "Contact us for manual payment processing."}')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_transcription_history_user_id ON transcription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status);
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(model_type);

-- Row Level Security (RLS) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles" ON user_profiles 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'legendgamerz9999@gmail.com'
        )
    );

-- RLS Policies for transcription_history
CREATE POLICY "Users can view own transcriptions" ON transcription_history 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcriptions" ON transcription_history 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all transcriptions" ON transcription_history 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'legendgamerz9999@gmail.com'
        )
    );

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage" ON usage_tracking 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_tracking 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all usage" ON usage_tracking 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'legendgamerz9999@gmail.com'
        )
    );

-- RLS Policies for ai_models (Admin only)
CREATE POLICY "Admin can manage ai_models" ON ai_models 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'legendgamerz9999@gmail.com'
        )
    );

CREATE POLICY "Users can view active models" ON ai_models 
    FOR SELECT USING (status = 'active');

-- RLS Policies for pricing_plans
CREATE POLICY "Everyone can view active pricing plans" ON pricing_plans 
    FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage pricing plans" ON pricing_plans 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'legendgamerz9999@gmail.com'
        )
    );

-- RLS Policies for admin_settings (Admin only)
CREATE POLICY "Admin can manage settings" ON admin_settings 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email = 'legendgamerz9999@gmail.com'
        )
    );

-- Functions
CREATE OR REPLACE FUNCTION reset_daily_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_profiles 
    SET daily_usage = 0, usage_reset_date = CURRENT_DATE
    WHERE usage_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user profile when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pricing_plans_updated_at
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
