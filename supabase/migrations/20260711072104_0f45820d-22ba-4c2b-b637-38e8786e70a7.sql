
-- ============ ROLES & PROFILES ============
CREATE TYPE public.app_role AS ENUM (
  'super_admin','admin','documentation','sales','accounts',
  'warehouse','production','purchase','quality','viewer'
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles read all authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles update self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles insert self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE POLICY "user_roles self read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "user_roles admin manage" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- On new user: create profile + default viewer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'viewer'));
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ MASTERS ============
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.countries TO authenticated;
GRANT ALL ON public.countries TO service_role;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "countries read" ON public.countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "countries write" ON public.countries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.ports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  country_id UUID REFERENCES public.countries(id),
  port_type TEXT DEFAULT 'sea',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ports TO authenticated;
GRANT ALL ON public.ports TO service_role;
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ports read" ON public.ports FOR SELECT TO authenticated USING (true);
CREATE POLICY "ports write" ON public.ports FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country_id UUID REFERENCES public.countries(id),
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers read" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "customers write" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hsn_code TEXT,
  unit TEXT DEFAULT 'SQM',
  description TEXT,
  default_rate NUMERIC(14,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products read" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products write" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.shipping_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipping_lines TO authenticated;
GRANT ALL ON public.shipping_lines TO service_role;
ALTER TABLE public.shipping_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sl read" ON public.shipping_lines FOR SELECT TO authenticated USING (true);
CREATE POLICY "sl write" ON public.shipping_lines FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_no TEXT,
  swift_code TEXT,
  ifsc_code TEXT,
  branch TEXT,
  ad_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banks TO authenticated;
GRANT ALL ON public.banks TO service_role;
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banks read" ON public.banks FOR SELECT TO authenticated USING (true);
CREATE POLICY "banks write" ON public.banks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ APPLICATIONS ============
CREATE TYPE public.app_status AS ENUM ('draft','in_progress','pending_approval','approved','rejected','shipped','closed');

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_no TEXT NOT NULL UNIQUE,
  status public.app_status NOT NULL DEFAULT 'draft',
  current_stage TEXT NOT NULL DEFAULT 'created',

  -- Exporter
  exporter_name TEXT DEFAULT 'SHREE HARI EXPORT HOUSE',
  exporter_address TEXT DEFAULT 'F-124, SHAKTI CHAMBER-1, 8-A NATIONAL HIGHWAY, MORBI, GUJARAT, INDIA',
  iec_no TEXT,
  gst_no TEXT,
  bin_no TEXT,
  state_of_origin TEXT DEFAULT 'GUJARAT',
  lut_no TEXT,

  -- Invoice
  invoice_no TEXT,
  invoice_date DATE,
  invoice_currency TEXT DEFAULT 'USD',

  -- Consignee / Notify / Third party
  customer_id UUID REFERENCES public.customers(id),
  consignee_name TEXT,
  consignee_address TEXT,
  notify_party TEXT,
  second_notify TEXT,
  third_party TEXT,

  -- Ports & terms
  port_loading_id UUID REFERENCES public.ports(id),
  port_discharge_id UUID REFERENCES public.ports(id),
  port_loading_text TEXT,
  port_discharge_text TEXT,
  country_origin TEXT DEFAULT 'INDIA',
  final_destination_id UUID REFERENCES public.countries(id),
  final_destination_text TEXT,
  payment_terms TEXT,
  export_terms TEXT,
  hsn_codes TEXT,
  products_desc TEXT,

  -- Bank
  bank_id UUID REFERENCES public.banks(id),

  -- Totals
  total_packages INTEGER DEFAULT 0,
  total_amount NUMERIC(14,2) DEFAULT 0,
  loading_charge NUMERIC(14,2) DEFAULT 0,
  amount_in_words TEXT,

  -- Declaration
  declaration TEXT DEFAULT 'We declare that this Invoice show the actual price of the goods described and that all the particulars are true and correct',

  -- Extras
  expected_shipment DATE,
  notes TEXT,
  meta JSONB DEFAULT '{}'::jsonb,

  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app read" ON public.applications FOR SELECT TO authenticated USING (true);
CREATE POLICY "app insert" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "app update" ON public.applications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "app delete admin" ON public.applications FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TABLE public.application_containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  container_no TEXT,
  line_seal_no TEXT,
  electronic_seal_no TEXT,
  size TEXT DEFAULT '20 FT',
  quantity TEXT DEFAULT '1x20 FT',
  seq INTEGER DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_containers TO authenticated;
GRANT ALL ON public.application_containers TO service_role;
ALTER TABLE public.application_containers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ac all" ON public.application_containers FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.application_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  container_id UUID REFERENCES public.application_containers(id) ON DELETE SET NULL,
  packages NUMERIC(12,2),
  description TEXT NOT NULL,
  quantity NUMERIC(12,2),
  unit TEXT DEFAULT 'SQM',
  rate NUMERIC(14,4),
  amount NUMERIC(14,2),
  net_weight NUMERIC(12,2),
  gross_weight NUMERIC(12,2),
  seq INTEGER DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_items TO authenticated;
GRANT ALL ON public.application_items TO service_role;
ALTER TABLE public.application_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai all" ON public.application_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  stage_key TEXT NOT NULL,
  stage_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  seq INTEGER NOT NULL DEFAULT 0,
  comment TEXT,
  acted_by UUID REFERENCES auth.users(id),
  acted_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_stages TO authenticated;
GRANT ALL ON public.application_stages TO service_role;
ALTER TABLE public.application_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "as all" ON public.application_stages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Auto app number
CREATE SEQUENCE IF NOT EXISTS public.app_no_seq START 1;
CREATE OR REPLACE FUNCTION public.generate_app_no()
RETURNS TEXT LANGUAGE sql AS $$
  SELECT 'EXP-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.app_no_seq')::text, 4, '0')
$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER applications_touch BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed default stages when application inserted
CREATE OR REPLACE FUNCTION public.seed_application_stages()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  stages TEXT[][] := ARRAY[
    ['created','Application Created'],
    ['requirement','Requirement Collection'],
    ['customer','Customer Details'],
    ['product','Product Selection'],
    ['quotation','Quotation'],
    ['price_approval','Price Approval'],
    ['proforma','Proforma Invoice'],
    ['customer_approval','Customer Approval'],
    ['purchase','Purchase Planning'],
    ['inventory','Inventory Verification'],
    ['production','Production Approval'],
    ['packing','Packing Approval'],
    ['commercial_invoice','Commercial Invoice'],
    ['packing_list','Packing List'],
    ['container','Container Allocation'],
    ['shipping_instruction','Shipping Instruction'],
    ['shipping_bill','Shipping Bill'],
    ['bl_draft','Bill of Lading Draft'],
    ['bl_approval','BL Approval'],
    ['certificates','Certificate Generation'],
    ['cert_verify','Certificate Verification'],
    ['finance','Finance Approval'],
    ['dispatch','Dispatch Approval'],
    ['completed','Shipment Completed'],
    ['closed','Application Closed']
  ];
  i INT;
BEGIN
  FOR i IN 1 .. array_length(stages,1) LOOP
    INSERT INTO public.application_stages(application_id, stage_key, stage_label, status, seq)
    VALUES (NEW.id, stages[i][1], stages[i][2],
            CASE WHEN i=1 THEN 'completed' ELSE 'pending' END, i);
  END LOOP;
  RETURN NEW;
END; $$;
CREATE TRIGGER applications_seed_stages AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.seed_application_stages();
