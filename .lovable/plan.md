

# Mapa Completo de APIs e Integrações Necessárias

Aqui está a análise de **todas as APIs e integrações** que você precisa configurar para que cada módulo do app funcione de verdade.

---

## Status Atual

**Já configurados:**
- ElevenLabs API Key (voz dos agentes)
- Lovable AI Gateway (geração de texto/IA — sem custo de API key)
- Supabase/Lovable Cloud (banco de dados, auth, edge functions)

**Faltam todas as integrações externas abaixo.**

---

## 1. WhatsApp Business API (CRÍTICA — módulo WhatsApp Inbox + Prospecção)

| Item | Detalhe |
|------|---------|
| **O que faz** | Enviar/receber mensagens reais pelo WhatsApp |
| **Onde obter** | Meta Business Suite → developers.facebook.com → WhatsApp API |
| **Secrets necessários** | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN` |
| **Custo** | ~R$0,30-0,80 por conversa (modelo por sessão de 24h) |
| **Módulos que depende** | WhatsApp Inbox, Prospecção (sequências), Atendimento automático, Closer Agent |
| **Passos** | 1. Criar conta Meta Business. 2. Criar App no Facebook Developers. 3. Ativar WhatsApp Product. 4. Obter número de teste. 5. Configurar webhook URL apontando para sua edge function `whatsapp-webhook`. |

---

## 2. Meta Ads API (Módulo Campanhas + Tráfego)

| Item | Detalhe |
|------|---------|
| **O que faz** | Criar, gerenciar e otimizar campanhas no Facebook/Instagram |
| **Onde obter** | developers.facebook.com → Marketing API |
| **Secrets necessários** | `META_ADS_ACCESS_TOKEN`, `META_ADS_ACCOUNT_ID` |
| **Custo** | Gratuito (API). Custo dos anúncios é do cliente. |
| **Módulos que depende** | Campanhas, Criativos, Analytics (métricas reais), MediaAgent |

---

## 3. Google Ads API (Módulo Campanhas)

| Item | Detalhe |
|------|---------|
| **O que faz** | Criar campanhas Search, Display, YouTube |
| **Onde obter** | Google Ads API Center → console.cloud.google.com |
| **Secrets necessários** | `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN` |
| **Módulos que depende** | Campanhas, Analytics |

---

## 4. Stripe (Módulo Billing/Pagamentos)

| Item | Detalhe |
|------|---------|
| **O que faz** | Cobrar clientes, gerenciar assinaturas, checkout |
| **Onde obter** | dashboard.stripe.com → API Keys |
| **Secret necessário** | `STRIPE_SECRET_KEY` (restricted key) |
| **Custo** | 2.9% + R$0,39 por transação |
| **Módulos que depende** | Settings (planos), Billing, Closer Agent (links de pagamento) |
| **Como ativar** | Lovable tem integração nativa com Stripe — basta ativar |

---

## 5. HubSpot CRM (Conector disponível via Lovable)

| Item | Detalhe |
|------|---------|
| **O que faz** | Sync de contatos/leads bidirecional |
| **Onde obter** | Conector Lovable (hubspot) — 1 clique |
| **Módulos que depende** | CRM, Prospecção, Integration Hub |

---

## 6. Resend / SendGrid (E-mail Marketing)

| Item | Detalhe |
|------|---------|
| **O que faz** | Enviar e-mails transacionais e campanhas |
| **Onde obter** | Conector Lovable (resend) disponível — 1 clique |
| **Módulos que depende** | Prospecção (sequências por e-mail), Campanhas, Automações |

---

## 7. Twilio (SMS + Voz — backup/complemento)

| Item | Detalhe |
|------|---------|
| **O que faz** | SMS, chamadas de voz, verificação |
| **Onde obter** | Conector Lovable (twilio) disponível — 1 clique |
| **Módulos que depende** | Voice Agent, Prospecção por SMS, 2FA |

---

## 8. ElevenLabs (Já configurado ✅)

| Item | Detalhe |
|------|---------|
| **O que faz** | Text-to-Speech para agentes de voz |
| **Status** | API Key já configurada |
| **Módulos que depende** | Sales Voice Agent, Agent Studio |

---

## 9. Firecrawl (Web Scraping para Prospecção)

| Item | Detalhe |
|------|---------|
| **O que faz** | Scraping inteligente de sites para enriquecer leads |
| **Onde obter** | Conector Lovable (firecrawl) disponível |
| **Módulos que depende** | Prospecção (pesquisa de leads), Knowledge Uploader |

---

## Resumo por Prioridade

```text
PRIORIDADE    INTEGRAÇÃO              MÉTODO              IMPACTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1 (ALTA)      WhatsApp Business API   Manual (Meta)       WhatsApp Inbox, Bot, Prospecção
2 (ALTA)      Stripe                  Nativo Lovable      Billing, Pagamentos
3 (ALTA)      Resend                  Conector Lovable    E-mails, Sequências
4 (MÉDIA)     Meta Ads API            Manual (Meta)       Campanhas Facebook/IG
5 (MÉDIA)     HubSpot                 Conector Lovable    CRM Sync
6 (MÉDIA)     Twilio                  Conector Lovable    SMS, Voz
7 (BAIXA)     Google Ads API          Manual (Google)     Campanhas Google
8 (BAIXA)     TikTok Ads API          Manual (TikTok)     Campanhas TikTok
9 (BAIXA)     Firecrawl               Conector Lovable    Enriquecimento de leads
```

---

## O Que Já Funciona SEM Novas APIs

Estes módulos já funcionam 100% com o que está configurado:

- **Dashboard** — dados do banco
- **CRM/Pipeline** — CRUD completo
- **Agent Studio** — configuração de agentes
- **Automations** — regras salvas no banco
- **Analytics** — métricas do banco
- **Marketplace** — instalação de agentes
- **Video Studio** — projetos salvos (sem renderização real)
- **Agent Prompts** — teste via Lovable AI
- **Onboarding** — perfil salvo no banco
- **Workflows** — orquestração salva no banco

---

## Plano de Implementação

### Fase 1 — Conectar Stripe + Resend + Twilio (Conectores Lovable — rápido)
1. Ativar Stripe nativo do Lovable
2. Conectar Resend para e-mails
3. Conectar Twilio para SMS/voz
4. Criar edge functions para cada integração

### Fase 2 — WhatsApp Business API (manual)
1. Você cria conta Meta Business e App
2. Obtém tokens e phone number ID
3. Eu configuro os secrets e conecto o webhook existente

### Fase 3 — Meta Ads + Google Ads (manual)
1. Você obtém as credenciais de cada plataforma
2. Eu crio edge functions para publicar/gerenciar campanhas

### Fase 4 — HubSpot + Firecrawl (conectores)
1. Conectar via Lovable
2. Criar sync bidirecional de leads

---

## Próximo Passo Recomendado

Me diga quais integrações você quer que eu implemente primeiro. As mais rápidas são **Stripe**, **Resend** e **Twilio** (conectores Lovable, sem precisar sair da plataforma). Para **WhatsApp** e **Meta Ads**, você precisará criar contas no Meta Business primeiro.

