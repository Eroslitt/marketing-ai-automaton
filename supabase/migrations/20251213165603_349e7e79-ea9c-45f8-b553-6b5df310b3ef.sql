
-- Tabela de produtos (o que está sendo vendido)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  checkout_link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de chunks de conhecimento (RAG) - usando JSONB para embeddings
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de leads aprimorada
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sentiment TEXT DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS assigned_agent TEXT DEFAULT 'sdr';

-- Tabela de conversas
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mensagens
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  agent_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de métricas de vendas
CREATE TABLE public.sales_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  leads_contacted INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,
  sales_completed INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Users can view their own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for knowledge_chunks (via product)
CREATE POLICY "Users can view knowledge for their products" ON public.knowledge_chunks FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = knowledge_chunks.product_id AND products.user_id = auth.uid()));
CREATE POLICY "Users can create knowledge for their products" ON public.knowledge_chunks FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE products.id = knowledge_chunks.product_id AND products.user_id = auth.uid()));
CREATE POLICY "Users can delete knowledge for their products" ON public.knowledge_chunks FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.products WHERE products.id = knowledge_chunks.product_id AND products.user_id = auth.uid()));

-- RLS Policies for conversations (via lead)
CREATE POLICY "Users can view conversations for their leads" ON public.conversations FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = conversations.lead_id AND leads.user_id = auth.uid()));
CREATE POLICY "Users can create conversations for their leads" ON public.conversations FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = conversations.lead_id AND leads.user_id = auth.uid()));

-- RLS Policies for messages (via conversation -> lead)
CREATE POLICY "Users can view messages for their conversations" ON public.messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.conversations c 
  JOIN public.leads l ON l.id = c.lead_id 
  WHERE c.id = messages.conversation_id AND l.user_id = auth.uid()
));
CREATE POLICY "Users can create messages for their conversations" ON public.messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations c 
  JOIN public.leads l ON l.id = c.lead_id 
  WHERE c.id = messages.conversation_id AND l.user_id = auth.uid()
));

-- RLS Policies for sales_metrics
CREATE POLICY "Users can view their own metrics" ON public.sales_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own metrics" ON public.sales_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own metrics" ON public.sales_metrics FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live sales feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
