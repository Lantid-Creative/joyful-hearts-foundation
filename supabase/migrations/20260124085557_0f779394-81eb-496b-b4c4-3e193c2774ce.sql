-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create programs table
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  impact TEXT,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL,
  goal DECIMAL(12,2) NOT NULL DEFAULT 0,
  raised DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create program_images table
CREATE TABLE public.program_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  amount DECIMAL(12,2) NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create volunteer_applications table
CREATE TABLE public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT,
  occupation TEXT,
  availability TEXT,
  skills TEXT,
  motivation TEXT,
  how_heard TEXT,
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partner_requests table
CREATE TABLE public.partner_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization_type TEXT,
  website TEXT,
  partnership_type TEXT,
  message TEXT,
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create program_inquiries table (for individual program contact forms)
CREATE TABLE public.program_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.programs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_inquiries ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for programs (public read, admin write)
CREATE POLICY "Programs are publicly readable" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Admins can manage programs" ON public.programs FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for program_images (public read, admin write)
CREATE POLICY "Program images are publicly readable" ON public.program_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage program images" ON public.program_images FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for donations (public insert, admin read)
CREATE POLICY "Anyone can create donation" ON public.donations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view donations" ON public.donations FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update donations" ON public.donations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for contact_submissions (public insert, admin read)
CREATE POLICY "Anyone can submit contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contacts" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.contact_submissions FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for volunteer_applications (public insert, admin read)
CREATE POLICY "Anyone can apply as volunteer" ON public.volunteer_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view volunteer apps" ON public.volunteer_applications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update volunteer apps" ON public.volunteer_applications FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for partner_requests (public insert, admin read)
CREATE POLICY "Anyone can submit partner request" ON public.partner_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view partner requests" ON public.partner_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update partner requests" ON public.partner_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for program_inquiries (public insert, admin read)
CREATE POLICY "Anyone can submit program inquiry" ON public.program_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view program inquiries" ON public.program_inquiries FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update program inquiries" ON public.program_inquiries FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for donations to track progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.programs;

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial programs data
INSERT INTO public.programs (slug, title, short_description, full_description, impact, icon_name, color, goal, raised, display_order) VALUES
('education-support', 'Education Support & Resources', 'We distribute learning materials and educational resources to rural children and schools.', 'We distribute learning materials and educational resources to rural children and schools. Our mentorship programs create platforms for interaction between rural and urban school children, fostering knowledge exchange and mutual understanding. Through book drives, school supply distributions, and educational workshops, we ensure that every child has the tools they need to succeed academically.', 'Providing books, school supplies, and educational materials to hundreds of children', 'BookOpen', 'bg-primary', 500000, 125000, 1),
('menstrual-hygiene', 'Menstrual Hygiene & Health Awareness', 'We conduct comprehensive menstrual hygiene education and distribute sanitary products to girls in rural areas.', 'We conduct comprehensive menstrual hygiene education and distribute sanitary products to girls in rural areas. This program promotes gender equity and ensures girls can attend school with dignity. We organize workshops that break taboos around menstruation and provide sustainable solutions for menstrual health management.', 'Breaking taboos and ensuring girls never miss school due to menstruation', 'Heart', 'bg-secondary', 300000, 85000, 2),
('childrens-rights', 'Children''s Rights Advocacy', 'Through workshops and outreach programs, we promote children''s rights education in rural communities.', 'Through workshops and outreach programs, we promote children''s rights education in rural communities. We organize awareness campaigns against early marriage and teenage pregnancy. Our team works with community leaders, parents, and local authorities to create protective environments for children.', 'Protecting children''s futures through education and community engagement', 'Shield', 'bg-accent', 250000, 45000, 3),
('cultural-development', 'Cultural & Moral Development', 'We establish cultural programs including storytelling, traditional games, and value-based leadership clubs.', 'We establish cultural programs including storytelling, traditional games, and value-based leadership clubs. These initiatives preserve heritage while developing character. Children learn important values through interactive sessions that celebrate Nigerian culture and traditions.', 'Celebrating culture while building tomorrow''s leaders', 'Sparkles', 'bg-earth-brown', 200000, 60000, 4),
('community-engagement', 'Community Engagement', 'We engage community leaders, parents, and traditional institutions in promoting child-friendly environments.', 'We engage community leaders, parents, and traditional institutions in promoting child-friendly and protective environments. Training is provided for volunteers, teachers, and caregivers. We facilitate community dialogues and training sessions that empower local stakeholders to take ownership of child welfare.', 'Building protective communities around every child', 'Users', 'bg-hope-green', 150000, 35000, 5),
('partnerships', 'Partnerships & Collaboration', 'We collaborate with government agencies, NGOs, schools, and faith-based organizations for sustainable development.', 'We collaborate with government agencies, NGOs, schools, and faith-based organizations for sustainable rural child development. Together, we advocate for supportive policies. Our partnerships extend our reach and ensure sustainable impact through shared resources and expertise.', 'Creating lasting change through strategic partnerships', 'Handshake', 'bg-sky-blue', 100000, 20000, 6),
('counselling', 'Counselling Services', 'We offer counselling sessions to protect vulnerable children, addressing trauma and providing emotional support.', 'We offer counselling sessions to protect vulnerable children, addressing trauma and providing emotional support to those in need. Our trained counsellors work with children who have experienced abuse, neglect, or other traumatic experiences, helping them heal and thrive.', 'Healing hearts and nurturing emotional wellbeing', 'MessageCircle', 'bg-sun-yellow', 180000, 40000, 7),
('safe-haven', 'Safe Haven Project', 'We are working towards building a home to accommodate orphans, victims of abuse, and pregnant teenagers.', 'We are working towards building a home to accommodate orphans, victims of abuse and trauma, and pregnant teenagers, providing them with safety, care, and opportunities. This flagship project will serve as a sanctuary where vulnerable children can find shelter, education, and hope for a better future.', 'Creating a sanctuary for the most vulnerable children', 'Home', 'bg-heart-red', 2000000, 150000, 8),
('other-initiatives', 'Other Initiatives', 'We continuously develop new programs to address emerging needs in rural communities.', 'We continuously develop new programs to address emerging needs in rural communities. From emergency relief to special projects, we remain flexible and responsive to the changing needs of the children we serve. Contact us to learn more about our current special initiatives.', 'Responding to emerging needs with innovative solutions', 'Star', 'bg-muted-foreground', 100000, 10000, 9);