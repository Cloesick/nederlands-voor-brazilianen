# 📱 Publicar o Nederlands! nas lojas (Play Store, App Store, Windows)

O app já é um **PWA completo e instalável**: manifest.json com ícones em todos os tamanhos, service worker
para uso offline, atalhos e screenshots. Isso significa que **não precisamos reescrever nada** — só empacotar
o PWA existente para cada loja. Tudo abaixo usa a URL de produção:

**URL de produção:** `https://nederlands-voor-brazilianen.vercel.app`

---

## 🤖 Android · Google Play (mais fácil, mais barato)

Taxa única: **US$ 25** (conta de desenvolvedor Google Play, vitalícia).

**Opção A — PWABuilder (sem instalar nada, recomendado):**
1. Acesse [pwabuilder.com](https://www.pwabuilder.com/)
2. Cole a URL de produção e clique em "Start"
3. Ele audita o manifest/service worker automaticamente (já devem passar ✅)
4. Clique em "Package for Stores" → Android → baixa um `.aab` pronto
5. Crie a conta em [play.google.com/console](https://play.google.com/console) (US$ 25)
6. Suba o `.aab`, preencha a ficha da loja (descrição, screenshots — já temos em `assets/screenshots/`)

**Opção B — Bubblewrap (linha de comando, mais controle):**
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://nederlands-voor-brazilianen.vercel.app/manifest.json
bubblewrap build
```
Isso gera o `.aab` localmente. Vercel já serve o `assetlinks.json` necessário? Não — você precisa criar
`/.well-known/assetlinks.json` com a impressão digital (fingerprint) SHA-256 do seu keystore, gerado pelo
próprio Bubblewrap no `init`. Adicione esse arquivo na pasta `.well-known/` do repo e faça push.

---

## 🍎 iOS · App Store (mais caro, requer Mac/CI)

Taxa: **US$ 99/ano** (Apple Developer Program).

1. PWABuilder também gera o pacote iOS: `pwabuilder.com` → "Package for Stores" → iOS
2. Isso baixa um projeto Xcode que embrulha o PWA num WKWebView
3. Precisa de um **Mac** (ou um serviço de CI como Codemagic/Bitrise) para compilar e assinar
4. Crie a conta em [developer.apple.com](https://developer.apple.com/programs/) (US$ 99/ano)
5. Abra o projeto no Xcode, configure o Bundle ID e Signing, "Archive" → envie pelo App Store Connect

**Alternativa sem Mac:** use [Capacitor](https://capacitorjs.com/) com um serviço de build em nuvem
(Codemagic tem tier gratuito) — o Capacitor consegue empacotar o mesmo `index.html`/`app.js`/`styles.css`
sem reescrever a lógica.

---

## 🪟 Windows · Microsoft Store (grátis!)

Conta de desenvolvedor individual: **grátis** (empresa paga uma taxa única pequena).

1. PWABuilder → "Package for Stores" → Windows → baixa um pacote `.msix`
2. Crie a conta em [partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard)
3. Suba o `.msix` no Partner Center, preencha a ficha (screenshots já prontos)
4. **Bônus:** o Windows também indexa PWAs direto do Edge sem pacote nenhum, então o app já é
   "instalável" no Windows agora mesmo, sem loja nenhuma.

---

## ✅ O que já está pronto (nada a fazer aqui)
- `manifest.json` com ícones 16/32/180/192/512 (+ versões *maskable* para Android)
- `sw.js` — funciona offline depois da primeira visita
- `assets/screenshots/` — capturas reais do app para a ficha da loja
- Atalhos rápidos (Woordenboek, Spelletjes, Revisão) já configurados no manifest

## ⛔ O que só você pode fazer (identidade/pagamento pessoais)
- Criar as contas de desenvolvedor (Google/Apple/Microsoft) — exigem seus dados/pagamento
- Assinar os pacotes com seu certificado (Bubblewrap/Xcode geram isso automaticamente na hora)

Quando tiver as contas criadas, me chame — eu preparo os textos da ficha da loja, categorias,
palavras-chave de ASO e reviso o pacote gerado antes do envio.
