# TeachTheMachine

> An interactive, in-browser machine learning education tool for middle and high school students — built for use in the **Muhlenberg College Computer Science program** (Math, CS & Stats).

🌐 **Live:** [teachthemachine.github.io](https://teachthemachine.github.io)  
👤 **Built by:** [Hamed Yaghoobian](https://hamedyaghoobian.com/) · Muhlenberg CS

---

## What Is This?

**TeachTheMachine** is a classroom-ready, guided platform that teaches the *mechanics* of machine learning through hands-on activities — not just the buzzwords.

It is designed around a core pedagogical belief:

> Students learn ML best when they *are* the data scientist — labelling examples, watching the model train step-by-step, and then trying to fool it.

Everything runs **entirely in the browser**. No servers, no sign-ups, no Python. Just open the link and start teaching.

---

## Who Is It For?

| Audience | Context |
|---|---|
| **7th–8th graders** | 30–60 minute guided classroom session |
| **High school CS classes** | Introduction to AI / data science unit |
| **Educators** | Used alongside in-person instruction (not a replacement for the teacher) |

---

## The Learning Pipeline

Every mission follows the same 3-step pipeline, which mirrors the real ML workflow:

```
1. Gather Data  →  2. Train Model  →  3. Test & Trick
```

Each step is scaffolded with plain-English explanations, animated transitions, and visual feedback so students understand **what the computer is actually doing** — not just that "the AI learned it."

---

## Missions

### 📬 Mission 1 — Real or Suspicious?
Students sort messages into **Real** and **Suspicious** piles, then train a Naive Bayes classifier. After training, the model reveals its *signature words* — the clues it used to decide. Students then try to write messages that fool it.

**Teaches:** Text classification, probability, the idea that ML = pattern-matching

---

### 🤖 Mission 2 — Human or Robot?
Students classify short messages as **Human** or **Robot** written. A great conversation starter about how LLMs generate text and what makes writing "sound human."

**Teaches:** Feature engineering, the limits of statistical models, Turing-style reasoning

---

### 🎨 Mission 3 — Doodle Sort *(Image Classification)*
Students draw simple shapes (circles, triangles) on a canvas. The model uses **MobileNet + K-Nearest Neighbors** to classify new doodles by comparing pixel patterns.

**Teaches:** Computer vision, transfer learning, how images become numbers

---

### 🔧 Mission 4 — Fix the Model
Students are shown a *broken* or *biased* classifier and must figure out why it's failing — then fix it by adding better examples.

**Teaches:** Model debugging, data quality, why garbage-in → garbage-out

---

## What Students Do (Step by Step)

### Step 1 · Gather Data
A horizontal **Tap-to-Sort** interface presents messages from an unsorted pool. Students drag or tap each one into the correct category. Hotkeys (`A` / `D` or `←` / `→`) allow fast sorting.

- Students can also add their own custom examples
- The model only trains on data *they* labelled

### Step 2 · Train the Model
An animated 4-stage training sequence shows exactly what the algorithm is doing:

1. 📖 Reading your labelled examples
2. ✂️ Chopping messages into individual words (tokenization)
3. 🔢 Counting word frequencies per class
4. 📐 Calculating probability weights with Bayes' theorem

After training, students see:
- **Signature Word chips** — the top words the model associates with each class, ranked by how discriminative they are (e.g. `urgent 3.4×`)
- **Sentence previews** — their own examples with individual words highlighted to show which ones the model considers strong evidence

### Step 3 · Test & Trick
Students type new messages and watch the model predict in real time with confidence bars. The challenge: *can you write a suspicious-looking message that the model thinks is real?*

---

## How It Works (Technical)

| Component | Technology |
|---|---|
| UI | React + TypeScript + Vite |
| Text classifier | Custom **Multinomial Naive Bayes** (from scratch, with Laplace smoothing) |
| Image classifier | **MobileNet** (feature extraction) + **K-Nearest Neighbors** |
| Animations | Framer Motion |
| Styling | Vanilla CSS, Material You (M3) design tokens |
| Deployment | GitHub Pages via GitHub Actions |
| Privacy | 100% client-side — no data is ever sent to a server |

The Naive Bayes classifier is intentionally written from scratch (see [`src/ml/NaiveBayesClassifier.ts`](src/ml/NaiveBayesClassifier.ts)) so that it is transparent and inspectable — students can theoretically trace every calculation.

---

## Running Locally

```bash
git clone https://github.com/teachthemachine/teachthemachine.github.io.git
cd teachthemachine.github.io
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deploying

Pushing to `main` automatically triggers a GitHub Actions workflow that builds and deploys to GitHub Pages.

```bash
git push origin main   # → automatically deploys
```

---

## Project Structure

```
src/
├── activities/
│   ├── text-classifier/       # Missions 1, 2, 4 (Naive Bayes)
│   │   ├── config.ts          # Mission metadata (goal, model analogy, etc.)
│   │   └── steps/             # CollectStep, TrainStep, TestStep
│   └── doodle-sort/           # Mission 3 (MobileNet + KNN)
│       └── steps/
├── components/
│   ├── MissionIntro/          # Pre-mission briefing screen
│   ├── PipelineLayout/        # Wizard shell (stepper + floating nav)
│   ├── Dashboard/             # Mission selection cards
│   └── Layout/                # Header, Footer
├── ml/
│   ├── NaiveBayesClassifier.ts   # Core text classifier (from scratch)
│   └── NaiveBayesAdapter.ts      # Clean public API
└── styles/
    ├── variables.css          # Design tokens (M3 color, spacing, radius)
    └── global.css             # Resets, base typography, button system
```

---

## Design Philosophy

- **Students are active, not passive.** Every step requires a decision — sorting, labelling, typing, drawing.
- **The black box is opened.** The training animation and post-training word analysis exist specifically to demystify ML.
- **Framing matters more than the tool.** The educator is present and uses this as a visual aid, not a worksheet.
- **Accessible by design.** Keyboard hotkeys, clear labels, no jargon without explanation.

---

## License & Attribution

© 2026 Hamed Yaghoobian · Muhlenberg College, Department of Math, CS & Stats  
All rights reserved.
