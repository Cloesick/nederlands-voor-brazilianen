# 📋 To-do — Nederlands! voor Brazilianen

Coisas pendentes, organizadas por quem precisa agir. Atualizado em 2026-07-09.

🚀 Para o raciocínio de *em que ordem* fazer as coisas abaixo (não só o quê), veja [ROLLOUT.md](ROLLOUT.md).

---

## 🔴 Bloqueado em você (contas pessoais/pagamento — não posso criar por você)

- [ ] **Google Play Console** — criar conta (US$ 25 único) → verificação de identidade (2-3 dias) → fazer upload do `.aab` **já pronto e assinado** (gerado em 2026-07-09, veja [STORES.md](STORES.md) pra localização exata + a senha da keystore). Empacotamento técnico já feito, não precisa mais do PWABuilder pra Android.
- [ ] **Apple Developer Program** — criar conta (US$ 99/ano) → precisa de Mac/CI pra compilar → empacotar via PWABuilder/Capacitor → enviar review (~24-48h). Guia: [STORES.md](STORES.md)
- [ ] **Microsoft Partner Center** — criar conta (grátis) → empacotar `.msix` via PWABuilder → enviar. O mais rápido dos três.
- [ ] **Conta Stripe** — criar produto "Premium" (sugestão € 4,99 único) → copiar Price ID + Secret key → configurar webhook. Guia: [MONETIZATION.md](MONETIZATION.md)
- [ ] **4 variáveis de ambiente na Vercel** (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_KEY` — a service_role key, NÃO a anon key, do projeto abaixo) → depois mudar `PREMIUM_ENABLED: false → true` em `config.js`. `SUPABASE_URL` = ⚠️ **o projeto antigo (`etrkpxutyzwjnxidzojo`) não existe mais** — pegue a URL do projeto atual no painel do Supabase (veja o item 🔴 abaixo). Verificado em produção em 2026-08-30: `/api/premium-status` responde `{"premium":false,"configured":false}`, ou seja, `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` **não estão setadas na Vercel** — são um store separado dos secrets do GitHub Actions, e precisam ser preenchidas nos dois lugares.
- [ ] **Conta Google AdSense** — cadastrar o site, aguardar aprovação (dias a semanas), depois preencher `ADSENSE_CLIENT`/`ADSENSE_SLOT` em `config.js`
- [ ] 🔴 **Projeto do Supabase sumiu** — o ref `etrkpxutyzwjnxidzojo` **não resolve mais no DNS** (`supabase.co` resolve, o subdomínio dele não), então não é pausa: projeto pausado mantém o DNS e responde com erro HTTP. O keep-alive falha com `curl` exit 6 (*could not resolve host*) **desde 2026-07-20** — as 4 primeiras execuções (8–16/07) passaram, todas as seguintes falharam. O plano pago não resolve isso, porque não é auto-pausa. Ação: abrir o painel do Supabase, ver qual projeto existe hoje, recriar a tabela `entitlements` se preciso, e atualizar o ref **nos dois lugares** (secret do GitHub Actions + env vars da Vercel).

Quando tiver qualquer uma dessas contas prontas, me chame — eu termino a configuração técnica (variáveis, testes) na hora.

---

## 🟡 Débito técnico conhecido (decisão consciente, não esquecimento)

- [ ] **Restaurar compra em outro aparelho** — Premium hoje é preso ao `deviceId` no `localStorage`; limpar o navegador ou trocar de aparelho perde o Premium. Adiado de propósito (decisão de 2026-07-08): ship sem isso primeiro, ver se vira reclamação real de usuário antes de construir captura de e-mail + lookup no Stripe pra resolver.
- [ ] **Sem teste real de compra** — o fluxo Stripe→webhook→Supabase→app nunca rodou de ponta a ponta com dinheiro de verdade (só existe o código). Testar assim que as contas do passo acima estiverem prontas, com o modo teste do Stripe primeiro.

---

## ✅ Configurado em 2026-07-08 (sem precisar de conta nova)

- [x] `LICENSE` (MIT) — projeto público agora tem licença clara
- [x] `robots.txt` + `sitemap.xml` — SEO básico
- [x] Open Graph + Twitter Card (com banner `assets/og-banner.png`) — link vira preview bonito no WhatsApp/redes
- [x] Tópicos do repositório no GitHub (dutch, portuguese, language-learning, pwa...) — descoberta
- [x] **Monitoramento de erros (Sentry)** — projeto `saspire/nederlands-voor-brazilianen` criado, DSN já embutido em `index.html`, ativo só em produção (não no localhost). Painel: https://saspire.sentry.io/projects/nederlands-voor-brazilianen/
- [⚠️] **Tabela do Supabase (`entitlements`)** — *(o projeto abaixo não existe mais, veja o item 🔴 acima)* criada e verificada num projeto **novo**, `nederlands-voor-brazilianen` (ref `etrkpxutyzwjnxidzojo`, plano Free, região eu-central-1). O "Cloesick's Project" antigo (`wvojkskfuvknisxymowy`) ficou pausado 90+ dias e é considerado perdido; não usar mais.
- [⚠️] **Proteção contra auto-pausa** — *(falhando desde 2026-07-20; ficou 5 semanas quebrada sem ninguém notar, porque um workflow agendado que falha só aparece na aba Actions)* `.github/workflows/supabase-keepalive.yml` pinga a API do Supabase 2x/semana (segunda e quinta) pra esse projeto novo nunca ficar 7 dias sem tráfego e ser pausado como o anterior. Usa a anon key (pública por design, sem risco).

## ✅ Configurado em 2026-07-09

- [x] **Conteúdo A1/A2 estendido**: 5→8 lições cada (cores/roupas, hobbies, clima/conversa fiada + restaurante, direções, correios/banco/telefone)
- [x] **Conteúdo B1/B2/C1 estendido**: B1 4→7, B2 3→6, C1 1→3 lições. Total: **35 lições em todos os 6 níveis**, nenhum nível mais "fraco"
- [x] **Woordenlijst mensal ativado** — o workflow existia mas nunca tinha rodado; agora tem julho (24 palavras, "Zomer en vakantie") e agosto (26 palavras, "Bloemen en natuur") publicados e testados
- [x] **Links sociais completos** — `data/social.json` agora cobre as 35 lições (era 18, faltavam as 9 mais novas)
- [x] `ROLLOUT.md` — plano de lançamento com sequência e raciocínio (validar grátis → lojas → monetização → loops de crescimento)

## 🟢 Autônomo (nada a fazer, só monitorar de vez em quando)

- [ ] Issue [#3](https://github.com/Cloesick/nederlands-voor-brazilianen/issues/3) "Add pronunciation recording practice" — na fila do autopilot, será implementada na próxima varredura noturna (07:00 CEST) ou quando o Course Coach semanal rodar
- [ ] Course Coach roda toda segunda-feira e abre novas issues sozinho conforme encontra lacunas — a fila nunca fica vazia por muito tempo
- [ ] Palavra/frase do dia e lista mensal se atualizam sozinhas todo dia/mês (a mensal já provou rodar sozinha: gerou agosto automaticamente sem eu disparar)

---

## 💡 Ideias descartadas por enquanto (não fazer sem pedir de novo)

- App nativo de verdade (React Native/Capacitor) em vez do wrapper PWA — só vale a pena se o PWA decolar e as lojas pedirem algo mais nativo
- Sistema de login/conta de usuário — resolveria o problema de restaurar compra, mas adiciona complexidade (senha, recuperação, etc.) que o app não tinha antes
