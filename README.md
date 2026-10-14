# Ressignificar o Estopar

Web-portfólio/manual educativo sobre psicologia aplicada ao ato de estopar no trading.

## Objetivo

Ajudar traders a ressignificar o stop: de símbolo de fracasso para ferramenta profissional de gestão de risco e execução de um plano probabilístico.

O projeto combina finanças comportamentais, psicologia da decisão e ferramentas inspiradas em TCC, ACT, regulação emocional, autocompaixão, intenções de implementação, intolerância à incerteza e princípios de aprendizagem.

## Estrutura atual

- `index.html` — página inicial e acesso aos módulos;
- `curso.html` — curso interativo de 8 módulos para aprender a definir, executar e revisar stops, com exercícios, simulações, quizzes e avaliação final;
- `simulador.html` — replay histórico candlestick com futuro oculto, ordens simuladas, stop/alvo, P&L em pontos/R e suporte principal a 2m/5m;
- `dados.html` — tutorial de obtenção/importação de históricos e limites de licenciamento;
- `manual.html` — manual com 30 artigos e acompanhamento local de leitura;
- `trilha.html` — trilha prática de 14 sessões, com foco em revisão, replay e simulação;
- `ferramentas.html` — exercícios interativos armazenados localmente no navegador;
- `laboratorio.html` — laboratório comportamental com autópsia de sessões, cadeia gatilho→diálogo→ação, checklist de dia de fúria, replay corretivo, detector educativo de assimetria ganho/perda e reset periódico de contexto;
- `referencias.html` — 41 referências bibliográficas comentadas;
- `assets/styles.css` — identidade visual, responsividade e impressão;
- `assets/app.js` — tema, busca, progresso, persistência e ferramentas interativas;
- `assets/course.js` — motor de quizzes, simulações, progresso do curso e exercício didático de dimensionamento;
- `assets/replay.js` — parser de CSV, IndexedDB, resampling, canvas candlestick, replay e motor de ordens.

## Temas do manual

O conteúdo aborda aversão à perda, efeito disposição, pensamentos automáticos, ACT/desfusão, pré-compromisso, planos Se–Então, revenge trade, treino gradual, viés de resultado, vergonha e identidade, pensamento contrafactual, sunk cost, perfeccionismo/medo de fracasso, intolerância à incerteza, FOMO pós-stop, autocompaixão disciplinada, a crença de que é necessário “recuperar” perdas anteriores, emoções incidentais, procrastinação da disciplina, sobreconfiança, P&L como placar emocional, valores operacionais e responsabilidade sem vergonha, anatomia do dia de fúria, diálogos internos, efeito disposição em perspectiva psicológica e neuroeconômica, gerenciamento versus repressão emocional, debiasing, reset de contexto e replay corretivo.

## Curso Aprender a Estopar

O curso possui oito módulos: significado profissional do stop; invalidação e dimensionamento; execução sem negociação emocional; efeito disposição; pós-stop e recuperação; dia de fúria; vieses/reset de contexto; e replay corretivo com avaliação final.

A progressão é baseada em domínio de processo. O aluno recebe feedback imediato, pode repetir quizzes e simulações e tem seu progresso salvo localmente no navegador. O curso não usa rentabilidade simulada como critério de aprovação.

## Replay histórico

O simulador trabalha com candles reais importados pelo usuário. Categorias suportadas: WINFUT, WDOFUT, NASDAQ/NQ/MNQ e S&P 500/ES/MES. Os timeframes principais são 2 e 5 minutos. Bases de 1 minuto podem ser agregadas para ambos; uma base de 5 minutos não pode reconstruir 2 minutos.

Formatos de importação previstos:
- CSV do TradingView com colunas OHLC;
- CSV do Profit/Nelogica com data, hora, OHLC e volume.

Os candles são guardados em IndexedDB e compartilhados entre os simuladores embutidos no curso. O repositório não redistribui bases intradiárias proprietárias sem autorização explícita.

## Como visualizar

Abra `index.html` no navegador ou publique a raiz do repositório com GitHub Pages.

O projeto é estático e não exige backend. Os exercícios usam `localStorage`; os dados permanecem no navegador e podem ser apagados quando o usuário limpa os dados do site.

## Princípio editorial

O manual não tenta fazer o usuário “gostar de perder”. O objetivo é treinar a capacidade de experimentar desconforto sem permitir que esse desconforto reescreva regras de risco tomadas fora do calor da operação.

Conceitos clínicos são utilizados com limites explícitos. Uma evidência válida em psicologia clínica, esporte ou decisão geral não é apresentada como prova automática de eficácia para performance de trading.

## Escopo e limites

Este projeto é educativo. Não substitui psicoterapia, avaliação psicológica ou atendimento médico, e não constitui recomendação financeira.

## Referências

Cada artigo liga diretamente à bibliografia pertinente. `referencias.html` reúne DOI e notas explicativas para consulta posterior.

## Licença

Conteúdo em desenvolvimento. Antes de redistribuir ou publicar comercialmente, defina uma licença explícita para o repositório.
