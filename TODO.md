# 📋 To-do — Nederlands! voor Brazilianen

Coisas pendentes, organizadas por quem precisa agir. Atualizado em 2026-07-08.

---

## 🔴 Bloqueado em você (contas pessoais/pagamento — não posso criar por você)

- [ ] **Google Play Console** — criar conta (US$ 25 único) → verificação de identidade (2-3 dias) → empacotar PWA via [PWABuilder](https://www.pwabuilder.com/) → enviar `.aab`. Guia: [STORES.md](STORES.md)
- [ ] **Apple Developer Program** — criar conta (US$ 99/ano) → precisa de Mac/CI pra compilar → empacotar via PWABuilder/Capacitor → enviar review (~24-48h). Guia: [STORES.md](STORES.md)
- [ ] **Microsoft Partner Center** — criar conta (grátis) → empacotar `.msix` via PWABuilder → enviar. O mais rápido dos três.
- [ ] **Conta Stripe** — criar produto "Premium" (sugestão € 4,99 único) → copiar Price ID + Secret key → configurar webhook. Guia: [MONETIZATION.md](MONETIZATION.md)
- [ ] **Rodar `db/entitlements.sql` no Supabase** — projeto escolhido: **"Cloesick's Project"** (`wvojkskfuvknisxymowy`). Meu conector Supabase está em modo somente-leitura, então isso precisa ser colado manualmente: [abrir o SQL Editor](https://supabase.com/dashboard/project/wvojkskfuvknisxymowy/sql/new) → colar o conteúdo de `db/entitlements.sql` → Run. 30 segundos.
- [ ] **4 variáveis de ambiente na Vercel** (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — os dois últimos vêm do projeto acima) → depois mudar `PREMIUM_ENABLED: false → true` em `config.js`
- [ ] **Conta Google AdSense** — cadastrar o site, aguardar aprovação (dias a semanas), depois preencher `ADSENSE_CLIENT`/`ADSENSE_SLOT` em `config.js`

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

## 🟢 Autônomo (nada a fazer, só monitorar de vez em quando)

- [ ] Issue [#3](https://github.com/Cloesick/nederlands-voor-brazilianen/issues/3) "Add pronunciation recording practice" — na fila do autopilot, será implementada na próxima varredura noturna (07:00 CEST) ou quando o Course Coach semanal rodar
- [ ] Course Coach roda toda segunda-feira e abre novas issues sozinho conforme encontra lacunas — a fila nunca fica vazia por muito tempo
- [ ] Palavra/frase do dia e lista mensal se atualizam sozinhas todo dia/mês

---

## 💡 Ideias descartadas por enquanto (não fazer sem pedir de novo)

- App nativo de verdade (React Native/Capacitor) em vez do wrapper PWA — só vale a pena se o PWA decolar e as lojas pedirem algo mais nativo
- Sistema de login/conta de usuário — resolveria o problema de restaurar compra, mas adiciona complexidade (senha, recuperação, etc.) que o app não tinha antes
