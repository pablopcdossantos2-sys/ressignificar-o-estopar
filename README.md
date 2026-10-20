# Ressignificar o Estopar

*Read this in other languages: [English](README-en.md)*

---

Web site educacional sobre psicologia do trading, com foco em ressignificar o stop como uma ferramenta profissional de gestão de risco — e não como fracasso pessoal.

**Site:** https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/  

> **Publicação:** o workflow em `.github/workflows/pages.yml` publica os arquivos da branch `main`. Consulte o [histórico do GitHub Actions](https://github.com/pablopcdossantos2-sys/ressignificar-o-estopar/actions/workflows/pages.yml) para acompanhar o status das implantações.

## Objetivo

Ajudar traders a executar stops e seguir planos operacionais mesmo diante de desconforto, frustração, esperança de reversão ou desejo de recuperar perdas. O projeto reúne artigos, exercícios, simulações e ferramentas de auto-observação baseados em conceitos de psicologia da decisão, finanças comportamentais e abordagens como TCC e ACT.

O conteúdo é educativo: evidências provenientes de psicologia clínica, esporte ou estudos gerais de decisão não são tratadas como prova automática de eficácia em trading.

## Comece por aqui

1. **[Página inicial](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/)** — visão geral e acesso às áreas do projeto.
2. **[Curso Aprender a Estopar](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/curso.html)** — oito módulos com exercícios, simulações, quizzes e avaliação final.
3. **[Simulador Histórico](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/simulador.html)** — replay candle a candle, com futuro oculto, ordens simuladas, stop, alvo e resultados em pontos/R.
4. **[Manual](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/manual.html)** — 31 artigos sobre vieses, emoções, disciplina, efeito disposição, recuperação de perdas e atenção ao aqui e agora.
5. **[Laboratório Comportamental](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/laboratorio.html)** — ferramentas para revisar sessões, reconhecer gatilhos e praticar o protocolo A.G.O.R.A.
6. **[Trilha prática](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/trilha.html)** — programa de 14 sessões para treino e revisão.
7. **[Ferramentas](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/ferramentas.html)** — exercícios interativos de apoio à prática.
8. **[Dados históricos](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/dados.html)** — orientações para importar candles e compreender limites de dados/licenciamento.
9. **[Bibliografia comentada](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/referencias.html)** — referências para consulta e aprofundamento.

## Estrutura do projeto

- **index.html** — página inicial;
- **curso.html** — curso interativo de oito módulos;
- **simulador.html** — replay histórico e motor de ordens simuladas;
- **dados.html** — tutorial de importação de históricos;
- **manual.html** — manual de artigos e acompanhamento local de leitura;
- **trilha.html** — trilha prática de 14 sessões;
- **ferramentas.html** — exercícios interativos;
- **laboratorio.html** — laboratório comportamental;
- **referencias.html** — bibliografia comentada;
- **assets/styles.css** — identidade visual e responsividade;
- **assets/app.js** — tema, busca, progresso e ferramentas interativas;
- **assets/course.js** — quizzes, simulações e progresso do curso;
- **assets/replay.js** — importação CSV, armazenamento local, agregação de candles, desenho do gráfico e execução simulada.

## Curso e princípios pedagógicos

Os oito módulos abordam: significado profissional do stop; invalidação e dimensionamento; execução sem negociação emocional; efeito disposição; pós-stop e desejo de recuperação; dia de fúria; vieses e atualização de contexto; replay corretivo e avaliação final.

A progressão é baseada no domínio do processo, não na rentabilidade simulada. O aluno pode repetir exercícios e quizzes, receber feedback e revisar suas decisões. O protocolo **A.G.O.R.A.** treina a separação entre fato observável, hipótese, desejo, regra e ação no presente.

## Simulador histórico

O simulador aceita candles importados pelo usuário para as categorias WINFUT, WDOFUT, NASDAQ/NQ/MNQ e S&P 500/ES/MES. Os timeframes prioritários são 2 e 5 minutos. Bases de 1 minuto podem ser agregadas para esses períodos; uma base de 5 minutos não permite reconstruir fielmente candles de 2 minutos.

Formatos previstos:
- CSV do TradingView com colunas OHLC;
- CSV do Profit/Nelogica com data, hora, OHLC e volume.

O replay oculta os candles futuros até o avanço da simulação. Stop e alvo são simulados com os dados disponíveis; quando ambos são atingidos no mesmo candle e não é possível saber a ordem intrabar, o simulador sinaliza a ambiguidade e adota uma convenção conservadora para o exercício.

### Dados e privacidade

O projeto não redistribui bases intradiárias proprietárias sem autorização. Importe apenas arquivos que você tenha direito de utilizar. Os candles ficam no IndexedDB do navegador; progresso e exercícios utilizam armazenamento local do navegador. Esses dados não são enviados a um servidor pelo site e podem ser apagados ao limpar os dados do navegador.

## Executar localmente

O projeto é estático e não exige backend ou processo de compilação. Para uma experiência local mais consistente, sirva a pasta raiz com qualquer servidor HTTP estático ou abra index.html diretamente no navegador. A versão pública depende da habilitação e da publicação bem-sucedida pelo GitHub Pages.

## Escopo e limites

O projeto é educativo. Não substitui psicoterapia, avaliação psicológica ou atendimento médico, e não constitui recomendação financeira. As ferramentas de auto-observação não são instrumentos diagnósticos.

## 👤 Autoria e desenvolvimento

Ressignificar o Estopar é uma aplicação web educacional e interativa, desenvolvida de forma independente por Pablo Phillipe Cândido dos Santos, voltada ao estudo da psicologia aplicada ao trading e ao treinamento de decisões relacionadas à execução de stops e à gestão comportamental do risco. Reúne curso, artigos, exercícios, ferramentas de auto-observação e simulador de replay histórico com dados importados pelo usuário.

O desenvolvimento contou com a utilização de ferramentas de inteligência artificial generativa como recurso auxiliar, mantendo-se sob responsabilidade do autor a concepção, implementação, integração e verificação do projeto.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
