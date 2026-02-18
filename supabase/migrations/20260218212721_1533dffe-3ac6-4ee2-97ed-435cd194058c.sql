
-- Rate limiting functions for public form submissions

-- Contact submissions: max 3 per email per hour
CREATE OR REPLACE FUNCTION public.is_rate_limited_contact(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) >= 3
  FROM public.contact_submissions
  WHERE lower(email) = lower(p_email)
    AND created_at > now() - interval '1 hour';
$$;

-- Volunteer applications: max 2 per email per 24 hours
CREATE OR REPLACE FUNCTION public.is_rate_limited_volunteer(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) >= 2
  FROM public.volunteer_applications
  WHERE lower(email) = lower(p_email)
    AND created_at > now() - interval '24 hours';
$$;

-- Partner requests: max 2 per email per 24 hours
CREATE OR REPLACE FUNCTION public.is_rate_limited_partner(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) >= 2
  FROM public.partner_requests
  WHERE lower(email) = lower(p_email)
    AND created_at > now() - interval '24 hours';
$$;

-- Update INSERT policy for contact_submissions
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact"
ON public.contact_submissions
FOR INSERT
WITH CHECK (NOT is_rate_limited_contact(email));

-- Update INSERT policy for volunteer_applications
DROP POLICY IF EXISTS "Anyone can apply as volunteer" ON public.volunteer_applications;
CREATE POLICY "Anyone can apply as volunteer"
ON public.volunteer_applications
FOR INSERT
WITH CHECK (NOT is_rate_limited_volunteer(email));

-- Update INSERT policy for partner_requests
DROP POLICY IF EXISTS "Anyone can submit partner request" ON public.partner_requests;
CREATE POLICY "Anyone can submit partner request"
ON public.partner_requests
FOR INSERT
WITH CHECK (NOT is_rate_limited_partner(email));
