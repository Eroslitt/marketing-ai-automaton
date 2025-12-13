
-- Tabela para perfis psicológicos (DISC)
CREATE TABLE public.lead_psychology (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  disc_profile TEXT CHECK (disc_profile IN ('dominance', 'influence', 'steadiness', 'compliance')),
  disc_scores JSONB DEFAULT '{}'::jsonb,
  big5_scores JSONB DEFAULT '{}'::jsonb,
  communication_style TEXT,
  prompt_injection TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para variantes de scripts de vendas (A/B Testing)
CREATE TABLE public.sales_script_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  content TEXT NOT NULL,
  tone TEXT DEFAULT 'balanced',
  is_champion BOOLEAN DEFAULT false,
  impressions INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  parent_id UUID REFERENCES public.sales_script_variants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para logs de evolução de scripts
CREATE TABLE public.script_evolution_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL REFERENCES public.sales_script_variants(id),
  event_type TEXT NOT NULL,
  old_champion_id UUID,
  new_champion_id UUID,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para chamadas de voz
CREATE TABLE public.voice_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  conversation_id UUID REFERENCES public.conversations(id),
  phone_number TEXT NOT NULL,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  status TEXT DEFAULT 'pending',
  duration_seconds INTEGER DEFAULT 0,
  transcript TEXT,
  sentiment TEXT,
  latency_avg_ms INTEGER,
  recording_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para regras de segurança (guardrails)
CREATE TABLE public.safety_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  rule_type TEXT CHECK (rule_type IN ('price_limit', 'content_filter', 'approval_required', 'forbidden_topic')),
  condition JSONB NOT NULL,
  action TEXT CHECK (action IN ('block', 'regenerate', 'escalate', 'warn')),
  is_active BOOLEAN DEFAULT true,
  violations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para log de violações
CREATE TABLE public.safety_violations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.safety_rules(id),
  conversation_id UUID REFERENCES public.conversations(id),
  original_message TEXT,
  violation_reason TEXT,
  action_taken TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para integrações externas
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb,
  is_connected BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_psychology ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_script_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_evolution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_psychology (via lead)
CREATE POLICY "Users can view psychology for their leads" ON public.lead_psychology FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_psychology.lead_id AND leads.user_id = auth.uid()));
CREATE POLICY "Users can create psychology for their leads" ON public.lead_psychology FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_psychology.lead_id AND leads.user_id = auth.uid()));

-- RLS Policies for sales_script_variants
CREATE POLICY "Users can manage their script variants" ON public.sales_script_variants FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for script_evolution_log
CREATE POLICY "Users can view their evolution logs" ON public.script_evolution_log FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.sales_script_variants WHERE sales_script_variants.id = script_evolution_log.variant_id AND sales_script_variants.user_id = auth.uid()));

-- RLS Policies for voice_calls (via lead)
CREATE POLICY "Users can view their voice calls" ON public.voice_calls FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = voice_calls.lead_id AND leads.user_id = auth.uid()));
CREATE POLICY "Users can create voice calls" ON public.voice_calls FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = voice_calls.lead_id AND leads.user_id = auth.uid()));

-- RLS Policies for safety_rules
CREATE POLICY "Users can manage their safety rules" ON public.safety_rules FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for safety_violations (via rule)
CREATE POLICY "Users can view their safety violations" ON public.safety_violations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.safety_rules WHERE safety_rules.id = safety_violations.rule_id AND safety_rules.user_id = auth.uid()));

-- RLS Policies for integrations
CREATE POLICY "Users can manage their integrations" ON public.integrations FOR ALL USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_sales_script_variants_updated_at BEFORE UPDATE ON public.sales_script_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for voice calls
ALTER PUBLICATION supabase_realtime ADD TABLE public.voice_calls;
