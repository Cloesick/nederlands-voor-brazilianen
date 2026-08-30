# 🧇 Nederlands! · Curso de neerlandês para brasileiros 🇧🇷→🇧🇪

Curso web completo e gratuito de **neerlandês (flamengo)** para falantes de **português do Brasil**, no estilo Babbel: lições curtas, exercícios interativos, flashcards com repetição espaçada e áudio.

**➡️ Estude agora: https://cloesick.github.io/nederlands-voor-brazilianen/**

📋 Pendências e próximos passos: [TODO.md](TODO.md) · 🚀 Plano de lançamento: [ROLLOUT.md](ROLLOUT.md) · Lojas de app: [STORES.md](STORES.md) · Monetização: [MONETIZATION.md](MONETIZATION.md)

## 🎨 O diferencial: frases-ponte com alinhamento de cores

Cada frase traduzida marca **o mesmo tipo de palavra com o mesmo estilo nas duas línguas**:

> *Wat* **is** de **naam** van _hem_? → *Qual* **é** o **nome** _dele_?

A palavra interrogativa é sempre roxa e itálica, o verbo sempre coral e negrito, o substantivo sempre azul, nas DUAS línguas. Toque numa palavra e o par dela acende. O cérebro aprende a ver a estrutura antes do vocabulário.

## 📚 O que tem dentro

| | |
|---|---|
| 📖 **18 lições** | A1 → C1, da apresentação ao flamengo de rua (tussentaal) |
| 🏋️ **200+ exercícios** | múltipla escolha, ouvir 🎧, completar ✍️, montar frases 🧱, ligar pares 🔗 |
| 🃏 **Flashcards SRS** | repetição espaçada estilo Leitner, salva no navegador |
| 🧩 **Vocabulário decomposto** | toda palavra composta quebrada peça por peça (ziekenhuis = zieken *doentes* + huis *casa*) |
| 📊 **Infográficos** | mapa de sons, árvore DE/HET, relógio "half drie", regra V2, a pinça, escada CEFR |
| 🔊 **Áudio** | voz neerlandesa nativa do navegador (Web Speech API) |
| ⚔️ **De Saga van de Lage Landen** | campanha de 6 capítulos com história real dos Países Baixos (1302 → 1898): corações, patentes, relíquias e missões |
| ⚡🔥 **Gamificação** | XP, sequência de dias, progresso por lição |
| 🎚️ **Seletor de nível** | clique em A1...C2 e veja TODO o conteúdo daquele nível junto (lições, frases, vocabulário, flashcards) |
| 🔊 **Klanken (sons)** | treino nativo de vogais curtas vs longas (man 👨 vs maan 🌙) e dígrafos, com áudio |
| 🎯 **Minhas dificuldades** | todo exercício errado entra numa quicklist automática para revisão focada |
| 🕐 **Emojis de relógio** | "half drie" e "14:30" aparecem com o relógio certo 🕝 (visualizar é a chave) |
| 🇧🇪 **Ontdek België** | geografia, cidades, política, esporte, cultura, história e fun facts (fontes: Wikipédia) |
| 🃏 **Baralhos** | 10 decks temáticos (417 cartas) de fontes abertas (FrequencyWords, Wiktionary) |
| 📕 **O Livro** | o Livro Infográfico completo (33 capítulos) em [livro.html](livro.html) |

## ⚔️ A campanha: De Saga van de Lage Landen

Os mesmos jogos de arrastar-e-soltar, mas embrulhados numa campanha com narrativa, para quem
acha "exercício de neerlandês" pouco convidativo. **Espadas, cercos e traições — só que a
história é toda verdadeira**, tirada do próprio cânone épico dos Países Baixos:

| Capítulo | Época | O que se aprende |
|---|---|---|
| 🌙 **De Brugse Metten** (A1) | Brugge, 1302 | A senha *"schild ende vriend"*: quem errava o `sch-` e o `-ui-` morria. Pronúncia com consequência narrativa. |
| 🐎 **Karel ende Elegast** (A2) | séc. XIII | Vocabulário do castelo e das armas, DE/HET, o primeiro romance de cavalaria em neerlandês |
| 🦊 **Van den vos Reynaerde** (B1) | séc. XIII | A epopeia animal: a raposa que vence com a língua, não com a espada. Verbos no fim da frase |
| 🏴‍☠️ **De Geuzen** (B2) | 1566–1585 | Beeldenstorm, Watergeuzen, a queda de Antuérpia. Linha do tempo de 20 séculos |
| ⚓ **De Gouden Eeuw** (C1) | Antuérpia | Comércio, imprensa, arte e governo — quando a língua vira poder |
| 🪶 **Tijl Uilenspiegel** (C2) | 1867 | Provérbios, ironia e nuance: a prova final |

Mecânicas: ❤️ 5 corações por capítulo (errar custa um), 🏚️ a *herberg* devolve os corações sem
apagar seu progresso, 🌟 selo **"zonder kleerscheuren"** para quem termina sem errar,
🗝️ uma **relíquia** por capítulo na *Relikwieënkamer*, e patentes de 🌾 *Dorpeling* a 👑 *Grootmeester*.

Conteúdo em [`data/games-saga.json`](data/games-saga.json); os capítulos são montados em `SAGA_CHAPTERS`
no [`app.js`](app.js) e reaproveitam o mesmo motor de jogos dos Spelletjes — nada é reimplementado.

## 🛠️ Stack

Vanilla JS + HTML + CSS, zero dependências, zero build. Os dados das lições são JSON puro em [`data/lessons/`](data/lessons/). Progresso no `localStorage`. Funciona offline depois do primeiro load (e dá para instalar como app pelo navegador).

## ✏️ Como criar/editar uma lição

1. Copie um JSON de `data/lessons/` e edite (schema documentado em [`data/SCHEMA.md`](data/SCHEMA.md)).
2. Rode `python build_manifest.py` para atualizar o índice.
3. Abra `index.html` num servidor local (`python -m http.server`) e teste.

## 🇧🇪 Notas de conteúdo

- Variante ensinada: **flamengo** (Bélgica), com notas quando difere do holandês.
- Pagamentos: ensinamos **Wero**, o sucessor do Payconiq.
- Nível A2 = o exigido pelo trajeto de integração (inburgering) na Flandres.

---

*Feito com ❤️ para quem fala português no coração e neerlandês no futuro. Veel succes! 🍀*
