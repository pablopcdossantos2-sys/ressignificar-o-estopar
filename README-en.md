# Ressignificar o Estopar

*Leia isto em outros idiomas: [Português](README.md)*

---

An educational website about trading psychology, focused on reframing the stop-loss as a professional risk-management tool rather than a personal failure.

**Website:** https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/  
**Repository:** https://github.com/pablopcdossantos2-sys/ressignificar-o-estopar

> **Deployment:** the workflow in `.github/workflows/pages.yml` publishes the files from the `main` branch. See the [GitHub Actions run history](https://github.com/pablopcdossantos2-sys/ressignificar-o-estopar/actions/workflows/pages.yml) to check deployment status.

## Purpose

Help traders follow stop-loss rules and trading plans despite discomfort, frustration, hopes of a reversal, or the urge to recover losses. The project brings together articles, exercises, simulations, and self-observation tools based on decision psychology, behavioral finance, and approaches such as cognitive behavioral therapy (CBT) and acceptance and commitment therapy (ACT).

The content is educational: evidence from clinical psychology, sports, or general decision-making studies is not treated as automatic proof of effectiveness in trading.

## Start here

1. **[Home page](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/)** — overview and access to the project sections.
2. **[Learn to Use Stop-Losses course](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/curso.html)** — eight modules with exercises, simulations, quizzes, and a final assessment.
3. **[Historical Simulator](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/simulador.html)** — candle-by-candle replay with future candles hidden, simulated orders, stop-losses, targets, and results in points/R.
4. **[Manual](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/manual.html)** — 31 articles on biases, emotions, discipline, the disposition effect, loss recovery, and attention to the present moment.
5. **[Behavioral Lab](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/laboratorio.html)** — tools for reviewing sessions, identifying triggers, and practicing the A.G.O.R.A. protocol.
6. **[Practice pathway](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/trilha.html)** — a 14-session program for practice and review.
7. **[Tools](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/ferramentas.html)** — interactive exercises to support practice.
8. **[Historical data](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/dados.html)** — guidance on importing candles and understanding data and licensing limits.
9. **[Annotated bibliography](https://pablopcdossantos2-sys.github.io/ressignificar-o-estopar/referencias.html)** — references for further reading.

## Project structure

- **index.html** — home page;
- **curso.html** — interactive eight-module course;
- **simulador.html** — historical replay and simulated-order engine;
- **dados.html** — historical data import guide;
- **manual.html** — article manual and locally stored reading progress;
- **trilha.html** — 14-session practice pathway;
- **ferramentas.html** — interactive exercises;
- **laboratorio.html** — behavioral lab;
- **referencias.html** — annotated bibliography;
- **assets/styles.css** — visual design and responsive layout;
- **assets/app.js** — theme, search, progress, and interactive tools;
- **assets/course.js** — quizzes, simulations, and course progress;
- **assets/replay.js** — CSV import, local storage, candle aggregation, chart rendering, and simulated order execution.

## Course and educational principles

The eight modules cover the professional meaning of a stop-loss; invalidation and position sizing; execution without emotional renegotiation; the disposition effect; post-stop reactions and the urge to recover losses; tilt or loss-of-control sessions; biases and context updates; and corrective replay with a final assessment.

Progress is based on mastery of the process, not simulated profitability. Learners can repeat exercises and quizzes, receive feedback, and review decisions. The **A.G.O.R.A.** protocol trains users to separate observable facts, hypotheses, desires, rules, and present-moment actions.

## Historical simulator

The simulator accepts user-imported candles for WINFUT, WDOFUT, NASDAQ/NQ/MNQ, and S&P 500/ES/MES. The main timeframes are 2 and 5 minutes. One-minute data can be aggregated into these intervals; five-minute data cannot faithfully reconstruct two-minute candles.

Supported formats:
- TradingView CSV files with OHLC columns;
- Profit/Nelogica CSV files with date, time, OHLC, and volume.

The replay keeps future candles hidden until the user advances the simulation. Stop-losses and targets are simulated from the available data. When both are reached within the same candle and the intrabar order cannot be determined, the simulator flags the ambiguity and uses a conservative convention for the exercise.

### Data and privacy

The project does not redistribute proprietary intraday datasets without authorization. Import only files you are entitled to use. Candles are stored in the browser's IndexedDB; progress and exercises use browser-local storage. The website does not send this data to a server, and it can be removed by clearing browser data.

## Run locally

The project is static and requires no backend or build process. For a more consistent local experience, serve the root folder with any static HTTP server or open index.html directly in a browser. Public availability depends on GitHub Pages being enabled and successfully deployed.

## Scope and limitations

The project is educational. It does not replace psychotherapy, psychological assessment, or medical care, and it is not financial advice. The self-observation tools are not diagnostic instruments.

## 👤 Authorship and development

Ressignificar o Estopar is an educational, interactive web application independently developed by Pablo Phillipe Cândido dos Santos. It supports the study of trading psychology and practice of decisions involving stop-loss execution and behavioral risk management. It brings together a course, articles, exercises, self-observation tools, and a historical replay simulator using data imported by the user.

Generative AI tools were used as an auxiliary resource during development. The author remains responsible for the project's conception, implementation, integration, and verification.

Currículo Lattes: [http://lattes.cnpq.br/9500873674712528](http://lattes.cnpq.br/9500873674712528)
