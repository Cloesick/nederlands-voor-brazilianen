# 💶 Monetização: gratuito + anúncios, Premium para break-even

Filosofia: o curso continua **100% gratuito para sempre**. Anúncios pagam o básico; o Premium
(compra única barata) cobre o resto e financia conteúdo novo. Tudo que dá para construir sem suas
contas pessoais já está pronto no código; faltam só os 4 passos abaixo, que exigem sua identidade/pagamento.

## ✅ O que já está pronto no código
- `db/entitlements.sql` — tabela do Supabase que guarda quem é Premium
- `api/checkout.js` — cria a sessão de pagamento no Stripe
- `api/stripe-webhook.js` — recebe a confirmação do Stripe e libera o Premium
- `api/premium-status.js` — o app consulta isso para saber se é Premium
- Tela `#/premium` no app com a lista de benefícios e botão de compra
- Espaço de anúncio (`adSlotHTML`) que só aparece se você configurar o AdSense E o usuário não for Premium
- Aviso de cookies com Google Consent Mode v2 (`assets/consent-init.js` + `initConsent()` em `app.js`) —
  aceitar tudo / só o essencial / personalizar, com link "Preferências de cookies" no rodapé pra mudar depois
- `config.js` — as 2-3 linhas que você edita quando tiver as contas

## ✅ Passo 1 — Supabase (armazenar quem é Premium) — JÁ FEITO
Projeto dedicado criado: **`nederlands-voor-brazilianen`** (ref `etrkpxutyzwjnxidzojo`, plano Free, eu-central-1).
A tabela `entitlements` já está criada e verificada (veja `db/entitlements.sql`).
`SUPABASE_URL` = `https://etrkpxutyzwjnxidzojo.supabase.co`. Falta só copiar a **service_role key**
(Project Settings → API no [dashboard](https://supabase.com/dashboard/project/etrkpxutyzwjnxidzojo/settings/api) —
não a anon key!) pro passo 3 abaixo.

## 🔲 Passo 2 — Stripe (receber o pagamento)
1. Crie a conta em [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Products → Add product → "Nederlands! Premium" → preço único (sugestão: **€ 4,99**, compra única — cobre os
   US$ 124 de taxas de loja com ~28 vendas, e depois é lucro/manutenção)
3. Copie o **Price ID** (começa com `price_...`)
4. Copie a **Secret key** em Developers → API keys (começa com `sk_live_...`)
5. Developers → Webhooks → Add endpoint → URL: `https://nederlands-voor-brazilianen.vercel.app/api/stripe-webhook`
   → evento: `checkout.session.completed` → copie o **Signing secret** (`whsec_...`)

## 🔲 Passo 3 — variáveis de ambiente na Vercel
No painel do projeto na Vercel → Settings → Environment Variables, adicione:

| Nome | Valor |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PRICE_ID` | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `SUPABASE_URL` | a Project URL do passo 1 |
| `SUPABASE_SERVICE_KEY` | a service_role key do passo 1 |

Depois disso, edite `config.js`: mude `PREMIUM_ENABLED: false` para `true`, faça commit e push.
(Também dá pra fazer via CLI: `vercel env add STRIPE_SECRET_KEY production`, etc. — me chame que eu rodo
os comandos, só preciso que você cole os valores.)

## 🔲 Passo 4 — Google AdSense (anúncios no plano gratuito) — Client ID já configurado
`ADSENSE_CLIENT` já está preenchido em `config.js` (reaproveitado da conta já aprovada, mesma usada no
Onbudsman) e `ads.txt` já está publicado na raiz do site (obrigatório pro AdSense verificar que você é o
vendedor autorizado). Falta só:
1. No [dashboard do AdSense](https://www.google.com/adsense/) → Sites → Adicionar site, use
   `nederlands-voor-brazilianen.vercel.app` e aguarde aprovação *deste site específico* (sites novos sob
   uma conta já aprovada ainda passam por revisão própria, geralmente mais rápida que a primeira vez)
2. Depois de aprovado, Anúncios → Por bloco de anúncios → Criar novo bloco (tipo "Display", responsivo) e
   copie o **Slot ID**
3. Edite `config.js`: `ADSENSE_SLOT: "..."`, commit e push

Anúncios não-personalizados aparecem para todo mundo assim que isso estiver configurado (não exigem
consentimento). Anúncios personalizados (CPM maior) só ativam para visitantes que escolherem isso
explicitamente no aviso de cookies — ver Passo 5.

## 🔲 Passo 5 — Google Analytics 4 (estatísticas de uso, opcional)
1. Em [analytics.google.com](https://analytics.google.com/), Admin → Criar propriedade, com estes valores:
   - **Nome da propriedade:** `Nederlands! (nederlands-voor-brazilianen.vercel.app)`
   - **Fuso horário:** Bruxelas (GMT+1) — combina com o público-alvo (Flandres)
   - **Moeda:** EUR
   - Categoria do setor: Educação
2. Crie um fluxo de dados **Web**, URL `https://nederlands-voor-brazilianen.vercel.app`, nome
   "Nederlands! - Web"
3. **Retenção de dados** (Admin → Configurações de dados → Retenção): mude de 14 meses (padrão) para
   **2 meses** — minimiza dados guardados, alinhado ao princípio de minimização do GDPR e desnecessário
   pra esse tipo de app (não precisamos de histórico longo por usuário)
4. Copie o **Measurement ID** (`G-XXXXXXXXXX`) do fluxo de dados
5. Edite `config.js`: `GA4_MEASUREMENT_ID: "G-..."`, commit e push

O script do GA4 só é carregado para visitantes que ativarem "estatísticas" no aviso de cookies
(Google Consent Mode v2, ver `assets/consent-init.js`) — nada é enviado ao Google antes disso.

## 📊 Conta do break-even
- Custo fixo: **US$ 124** (Google Play $25 + Apple $99/ano). Windows e Vercel/GitHub Pages são grátis.
- Premium a € 4,99: **~28 vendas** cobrem o primeiro ano inteiro
- Anúncios: renda passiva contínua sobre os usuários gratuitos, sem esforço extra

## 🔐 Segurança
O navegador nunca fala direto com Stripe/Supabase — só com `/api/*`, que roda no servidor da Vercel
com as chaves secretas. A tabela `entitlements` tem RLS ativado sem nenhuma política pública: só a
`service_role key` (usada dentro das funções `/api`) consegue ler/escrever.
