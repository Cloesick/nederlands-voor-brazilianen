# 🧇 Nederlands! · Curso de neerlandês para brasileiros 🇧🇷→🇧🇪

Curso web completo e gratuito de **neerlandês (flamengo)** para falantes de **português do Brasil**, no estilo Babbel: lições curtas, exercícios interativos, flashcards com repetição espaçada e áudio.

**➡️ Estude agora: https://cloesick.github.io/nederlands-voor-brazilianen/**

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
| ⚡🔥 **Gamificação** | XP, sequência de dias, progresso por lição |
| 📕 **O Livro** | o Livro Infográfico completo (33 capítulos) em [livro.html](livro.html) |

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
