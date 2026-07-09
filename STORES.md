# 📱 Publicar o Nederlands! nas lojas (Play Store, App Store, Windows)

O app já é um **PWA completo e instalável**: manifest.json com ícones em todos os tamanhos, service worker
para uso offline, atalhos e screenshots. Isso significa que **não precisamos reescrever nada** — só empacotar
o PWA existente para cada loja. Tudo abaixo usa a URL de produção:

**URL de produção:** `https://nederlands-voor-brazilianen.vercel.app`

**URL da política de privacidade** (as 3 lojas pedem esse campo no formulário de submissão, sem exceção):
`https://nederlands-voor-brazilianen.vercel.app/privacy.html`

---

## ✅ Android: o `.aab` já está pronto e assinado (2026-07-09)

Não precisa mais rodar PWABuilder/Bubblewrap para Android — já foi gerado e testado localmente:

| O quê | Onde |
|---|---|
| **Arquivo pra subir na Play Console** | `android-package/app/build/outputs/bundle/release/app-release.aab` (1,4 MB) |
| **Keystore de assinatura** (⚠️ backup manual obrigatório, sem isso nunca mais dá pra atualizar o app) | `android-package/android.keystore` |
| **Senha da keystore/chave** | `NederlandsApp2026` |
| **Package ID** | `com.saspire.nederlands` |
| **Digital Asset Links** | já publicado em produção: `https://nederlands-voor-brazilianen.vercel.app/.well-known/assetlinks.json` |

**A pasta `android-package/` está no `.gitignore` de propósito** — o keystore nunca deve ir pro GitHub público.
Faça backup manual do arquivo `android.keystore` + a senha acima (ex.: num gerenciador de senhas) antes de
qualquer coisa. Se perder os dois, você não consegue mais publicar atualizações do app, só um app novo do zero.

**Próximo passo real:** criar a conta em [play.google.com/console](https://play.google.com/console) (US$ 25),
criar o app novo, e fazer upload direto do `app-release.aab` acima na aba de release. Nada de empacotamento
técnico sobrando.

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

---

## 📝 Ficha da loja — Google Play (pronta pra copiar e colar)

**Nome do app** (máx. 30 caracteres): `Nederlands! Curso de Holandês`

**Descrição curta** (máx. 80 caracteres):
`Neerlandês (flamengo) do zero ao avançado, grátis, feito pra brasileiros`

**Descrição completa** (máx. 4000 caracteres):
```
🧇 Nederlands! é um curso completo e 100% gratuito de neerlandês (holandês
falado na Bélgica/Flandres), feito especificamente para brasileiros que
vivem ou estão se mudando pra Flandres.

🎨 O QUE TORNA ESSE CURSO DIFERENTE
Cada frase mostra o português e o neerlandês lado a lado, com cada tipo de
palavra (verbo, substantivo, artigo...) na mesma cor nas duas línguas. Seu
cérebro aprende a "ver" a estrutura da frase antes mesmo de entender cada
palavra — muito mais rápido que decorar frases soltas.

📚 TUDO QUE VOCÊ PRECISA, DO A1 AO C2
- Todos os níveis do CEFR, do "oi, tudo bem?" (A1) até discutir política e
  ironia em neerlandês (C1/C2) — 37 lições e crescendo
- Exercícios estilo Babbel: múltipla escolha, ouvir e escrever, montar
  frases, associar pares
- Flashcards com repetição espaçada (SRS) — revisa só o que você esquece
- Dicionário rápido (Woordenboek) pra busca instantânea
- Jogos de arrastar e soltar, treino de sons, seção de cultura flamenga
  (música, história, curiosidades de Bruxelas/Antuérpia/Gante)
- Funciona offline depois da primeira visita

🇧🇪 FEITO PRA VIDA REAL NA FLANDRES
Vocabulário de inburgering, NT2, banco, aluguel, médico, escola dos
filhos — não só "frases de turista".

🆓 GRATUITO E DE CÓDIGO ABERTO
Sem cadastro, sem cartão de crédito pra começar. Seu progresso fica só no
seu aparelho. Código aberto no GitHub — qualquer um pode ver exatamente
como funciona.

⚡ Criado por brasileiros que passaram pelo mesmo processo de imigração,
pra ajudar quem vem depois.
```

**Categoria:** Educação
**Classificação de conteúdo:** Livre (sem violência, sem conteúdo gerado por usuário)
**Palavras-chave/ASO:** neerlandês, holandês, flamengo, curso de idiomas, brasileiros na bélgica,
inburgering, NT2, aprender holandês, flandres, antuérpia, bruxelas, gante

**Screenshots:** só temos 2 prontos (`assets/screenshots/home.png`, `games.png`). A Play Store aceita
mínimo 2, mas recomenda 4-8 — vale capturar também a tela de lição (frases coloridas), flashcards, e
Woordenboek antes de submeter, pra ficha ficar mais convincente.

### 🔒 Formulário "Segurança dos dados" (Data Safety) — respostas exatas
A Play Console exige esse formulário e ele é checado contra o comportamento real do app (respostas
erradas podem suspender o app depois). Baseado no que está implementado agora:

| Pergunta | Resposta |
|---|---|
| O app coleta ou compartilha algum dos tipos de dados de usuário? | Sim |
| Dados coletados | Nenhum obrigatório. Opcionalmente (com consentimento explícito no app): dados de uso/analytics (Google Analytics) e dados de publicidade (Google AdSense) |
| Esses dados são compartilhados com terceiros? | Sim, apenas com o Google (Analytics/AdSense), apenas se o usuário consentir |
| Os dados são criptografados em trânsito? | Sim (HTTPS/TLS em todo o site) |
| O usuário pode pedir a exclusão dos dados? | Sim — não precisa nem pedir: o progresso fica só no aparelho e pode ser apagado limpando os dados do site no navegador; consentimento de cookies pode ser revogado a qualquer momento no app |
| Finalidade da coleta | Analytics: melhorar o curso. Publicidade: manter o app gratuito |
| Coleta é obrigatória para usar o app? | Não — o app funciona 100% sem consentir nada |

Link obrigatório no formulário: `https://nederlands-voor-brazilianen.vercel.app/privacy.html`
