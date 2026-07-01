-- Create enum types for roles and statuses
CREATE TYPE public.user_role AS ENUM ('client', 'lawyer', 'admin');
CREATE TYPE public.lawyer_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.consultation_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE public.consultation_type AS ENUM ('chat', 'audio', 'video');
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal', 'consultation_fee', 'commission', 'refund');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table for all users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Legal categories
CREATE TABLE public.legal_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyer profiles (extended info for lawyers)
CREATE TABLE public.lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  specializations TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  education TEXT,
  bar_council_number TEXT,
  price_per_minute DECIMAL(10,2) DEFAULT 5.00,
  session_price DECIMAL(10,2) DEFAULT 100.00,
  status lawyer_status DEFAULT 'pending',
  is_available BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_consultations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lawyer categories junction table
CREATE TABLE public.lawyer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.legal_categories(id) ON DELETE CASCADE,
  UNIQUE(lawyer_id, category_id)
);

-- Wallets for clients and lawyers
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type consultation_type NOT NULL,
  status consultation_status DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_amount DECIMAL(10,2),
  commission_amount DECIMAL(10,2),
  lawyer_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages for chat consultations
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawal requests
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status withdrawal_status DEFAULT 'pending',
  bank_details JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform settings
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  min_withdrawal DECIMAL(10,2) DEFAULT 50.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyer_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies

-- Profiles: Users can read all, update own
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- User roles: Users can read own, admins can manage all
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Legal categories: Public read
CREATE POLICY "Anyone can view categories" ON public.legal_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.legal_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Lawyer profiles: Public read for approved, owners can update
CREATE POLICY "View approved lawyers" ON public.lawyer_profiles FOR SELECT USING (status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Lawyers can insert own profile" ON public.lawyer_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Lawyers can update own profile" ON public.lawyer_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Lawyer categories
CREATE POLICY "Anyone can view lawyer categories" ON public.lawyer_categories FOR SELECT USING (true);
CREATE POLICY "Lawyers can manage own categories" ON public.lawyer_categories FOR ALL TO authenticated USING (
  lawyer_id IN (SELECT id FROM public.lawyer_profiles WHERE user_id = auth.uid())
);

-- Wallets: Users can view own
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "System can update wallets" ON public.wallets FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Transactions: Users can view own
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Consultations: Participants and admins can view
CREATE POLICY "View own consultations" ON public.consultations FOR SELECT TO authenticated USING (client_id = auth.uid() OR lawyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can create consultations" ON public.consultations FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());
CREATE POLICY "Participants can update consultations" ON public.consultations FOR UPDATE TO authenticated USING (client_id = auth.uid() OR lawyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Reviews: Public read
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

-- Messages: Consultation participants can access
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT TO authenticated USING (
  consultation_id IN (SELECT id FROM public.consultations WHERE client_id = auth.uid() OR lawyer_id = auth.uid())
);
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- Withdrawal requests
CREATE POLICY "Users can view own withdrawals" ON public.withdrawal_requests FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create withdrawals" ON public.withdrawal_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update withdrawals" ON public.withdrawal_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Platform settings: Admins only
CREATE POLICY "Admins can view settings" ON public.platform_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Trigger to create profile and wallet on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::public.user_role
  )
  ON CONFLICT (user_id, role) DO NOTHING;

  IF NEW.raw_user_meta_data->>'role' = 'lawyer' THEN
    INSERT INTO public.lawyer_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.legal_categories (name, description, icon) VALUES
('Family Law', 'Divorce, custody, marriage, adoption', 'Users'),
('Criminal Law', 'Criminal defense, bail, appeals', 'Shield'),
('Corporate Law', 'Business formation, contracts, compliance', 'Building'),
('Property Law', 'Real estate, landlord-tenant, property disputes', 'Home'),
('Immigration Law', 'Visas, citizenship, deportation defense', 'Globe'),
('Labor Law', 'Employment disputes, workplace rights', 'Briefcase'),
('Tax Law', 'Tax planning, disputes, compliance', 'Calculator'),
('Intellectual Property', 'Patents, trademarks, copyrights', 'Lightbulb'),
('Civil Litigation', 'Lawsuits, disputes, settlements', 'Scale'),
('Consumer Protection', 'Consumer rights, fraud, refunds', 'ShieldCheck');

-- Insert default platform settings
INSERT INTO public.platform_settings (commission_rate, min_withdrawal) VALUES (20.00, 50.00);