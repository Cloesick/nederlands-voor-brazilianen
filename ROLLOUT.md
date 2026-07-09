# 🚀 Rollout, publicação e monetização — o plano

Isto não repete o [TODO.md](TODO.md) (que é a lista granular do que falta clicar). Aqui é a **sequência
e o raciocínio**: em que ordem fazer as coisas e por quê, dado onde o projeto está hoje.

---

## 📍 Onde estamos (2026-07-09)

- **Produto**: 36 lições A1→C2, jogos de arrastar-soltar, dicionário, flashcards SRS, treino de sons,
  conteúdo cultural sobre Bélgica/Holanda, palavra do dia + lista mensal automatizadas.
- **Infra**: PWA instalável e offline, deploy automático (GitHub Pages + Vercel), monitoramento de erros,
  autopilot que corrige bugs e adiciona conteúdo sozinho, Course Coach semanal que audita e abre issues.
- **Monetização**: código pronto (Stripe + Supabase + AdSense), mas **desligado** (`PREMIUM_ENABLED: false`)
  — nenhuma conta paga foi criada ainda.
- **Distribuição**: só a URL direta. Zero em lojas de apps, zero em redes sociais, zero SEO orgânico
  acumulado (site é novo, sem backlinks, sem histórico de indexação).

**A pergunta real não é "o que falta construir" — é quase tudo já existe. A pergunta é em que ordem
ativar as peças pra não desperdiçar esforço.**

---

## 🎯 A sequência recomendada (e por quê essa ordem)

### Fase 1 — Validar com tráfego grátis, antes de gastar um euro
**Por quê primeiro:** não faz sentido pagar US$ 25-99 de conta de loja, nem configurar Stripe/AdSense,
pra um produto que ainda ninguém testou de verdade. Validação é grátis; contas pagas não são.

- [ ] Compartilhar a URL em 2-3 comunidades reais de brasileiros na Flandres/Bélgica (grupos de Facebook
  "Brasileiros em Antuérpia/Bruxelas/Gent", subreddits locais, fóruns de inburgering)
- [ ] Você já roda um pipeline de conteúdo (Instagram/YouTube) pra outros nichos — o mesmo playbook
  (carrossel com hook + valor + CTA) funciona aqui: "3 erros que todo brasileiro comete em neerlandês"
  como carrossel, linkando pro app. Zero custo, usa infraestrutura que já existe.
- [ ] Métrica que importa nesta fase: **quantas pessoas voltam no dia seguinte** (retenção), não quantas
  visitam uma vez. O app já registra isso localmente (`localStorage` streak) — se eu tiver acesso a
  Analytics real (ver Fase 1b) dá pra medir de fora.

**Fase 1b (opcional, grátis, 10 min):** GA4 (Google Analytics) é instantâneo — sem fila de aprovação
como o AdSense. Se quiser medir tráfego/retenção de verdade antes de decidir investir mais, crie uma
propriedade GA4 e me passe o Measurement ID (`G-XXXXXXX`) — eu conecto na hora.

### Fase 2 — Lojas de apps (SÓ depois que Fase 1 mostrar gente voltando)
**Por quê nessa ordem:** lojas custam dinheiro e dão trabalho de review (dias). Só vale a pena se o produto
já provou que segura atenção. Empacotar um PWA sem uso real nas lojas é gastar tempo em distribuição pra
zero demanda.

- [ ] **Microsoft Store primeiro** — é grátis e o mais rápido dos três (PWABuilder empacota em minutos,
  review é leve). Bom teste de fogo do processo de empacotamento antes dos pagos.
- [ ] **Google Play depois** — US$ 25 único (não recorrente), maior alcance de Android que é provavelmente
  o SO mais comum entre o público-alvo.
- [ ] **Apple por último** — US$ 99/ano (recorrente!) e precisa de Mac/CI. É o mais caro e o único com
  custo anual, então só compensa se o produto já mostrou tração nas outras duas.

Guia técnico completo (comandos, PWABuilder, .aab/.msix): [STORES.md](STORES.md).

### Fase 3 — Monetização (SÓ depois que Fase 1-2 trouxerem uso real)
**Por quê por último, não primeiro:** o código já está pronto e testado estruturalmente — ativar leva
literalmente minutos assim que as contas existirem. O gargalo nunca foi código, é ter usuários pra
monetizar. Ativar cedo demais só adiciona manutenção (webhooks, disputas, suporte) sem receita
proporcional.

- [ ] **AdSense primeiro** — sem custo de conta, mas fila de aprovação (dias-semanas) e eles querem ver
  tráfego real, não zero. Registre o domínio assim que a Fase 1 gerar visitas consistentes, não antes
  (aumenta a chance de aprovação na primeira tentativa).
- [ ] **Stripe Premium depois** — ative quando tiver uma hipótese de preço testável (sugestão: € 4,99
  único, ver [MONETIZATION.md](MONETIZATION.md)) e uma métrica de quantas pessoas completariam 3+ lições
  (sinal de que valorizam o produto o suficiente pra pensar em pagar).

**O ponto de equilíbrio (break-even) real:** hospedagem já é grátis (Vercel/GitHub Pages free tier,
Supabase free tier com keep-alive). O único custo fixo se as lojas entrarem é Apple (US$ 99/ano). Ou
seja: **2-3 compras de € 4,99 por mês já cobrem o único custo recorrente que existe.** Isso é a barra de
break-even real, não uma projeção otimista — é literalmente baixa.

### Fase 4 — Loops de crescimento (contínuo, começa em paralelo com a Fase 1)
Diferente das outras fases, isto não é sequencial — roda o tempo todo, cresce em intensidade conforme o
produto amadurece:

- **Conteúdo → app**: cada carrossel/reel vira um convite pro app (padrão que você já usa nos outros
  nichos: gancho + valor + CTA suave)
- **App → conteúdo**: o inverso também funciona — "palavra do dia" e "frase do dia" já gerados
  automaticamente todo dia são matéria-prima pronta pra posts (zero trabalho extra, o conteúdo já existe
  em `data/daily/`)
- **SEO orgânico**: o Livro Infográfico (`livro.html`) tem texto real indexável — ao contrário do app
  (SPA por hash, mais difícil de indexar), o livro pode ranquear pra buscas tipo "aprender holandês
  português" com o tempo. `sitemap.xml` já aponta pra ele.
- **Parcerias**: centros de inburgering/CVO da Flandres às vezes indicam material de apoio gratuito pros
  alunos — um e-mail simples pra 2-3 centros em Antuérpia oferecendo o app como recurso gratuito pode
  gerar tráfego qualificado de graça.

---

## ⚠️ Coisas a verificar antes de cada fase (não pular)

- **Antes da Fase 2 (lojas):** revisar `STORES.md` — cada loja tem política própria sobre apps
  "wrapper" de PWA; confirmar que não vai ser rejeitado por "conteúdo mínimo" (36 lições deve bastar,
  mas revisar as diretrizes atuais antes de submeter vale 10 minutos).
- **Antes da Fase 3 (Stripe):** o app roda na UE → GDPR se aplica de verdade aqui (dados de pagamento,
  cookies do AdSense). Stripe e AdSense já são compliant por padrão, mas vale conferir se falta um
  banner de cookies/consentimento quando AdSense for ativado (ele injeta cookies de rastreamento).
- **Antes de qualquer campanha paga de tráfego:** não recomendado ainda — grátis primeiro (Fase 1),
  pago só faz sentido depois que a taxa de conversão orgânica (visita → volta no dia seguinte → compra)
  for conhecida. Gastar em anúncios sem essa taxa é queimar dinheiro às cegas.

---

## 🧭 Resumo em uma frase por fase

1. **Valide de graça** (grupos, redes que você já tem) — meça se voltam.
2. **Empacote nas lojas** começando pela grátis (Microsoft), só depois as pagas.
3. **Ligue o dinheiro** (AdSense → Stripe) só quando já tiver gente usando de verdade.
4. **Conteúdo e app se alimentam um do outro**, o tempo todo, sem custo extra.

Quando quiser avançar qualquer fase, me chame — a maior parte do trabalho técnico (ativar Stripe,
empacotar pras lojas, conectar Analytics) eu faço na hora assim que a conta/decisão existir do seu lado.
