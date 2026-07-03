import { useMemo, useState } from "react";

type Suit = "spades" | "hearts" | "diamonds" | "clubs";

type PlayingCard = {
  rank: string;
  suit: Suit;
};

type HandRank = {
  name: string;
  english: string;
  strength: number;
  short: string;
  explanation: string;
  example: PlayingCard[];
  note: string;
};

type Stage = {
  name: string;
  cards: PlayingCard[];
  pot: number;
  action: string;
  teacherNote: string;
};

type ActionInfo = {
  name: string;
  description: string;
  example: string;
};

const suitLabels: Record<Suit, string> = {
  spades: "♠",
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
};

const heroCards: PlayingCard[] = [
  { rank: "A", suit: "spades" },
  { rank: "A", suit: "hearts" },
];

const boardCards: PlayingCard[] = [
  { rank: "K", suit: "clubs" },
  { rank: "10", suit: "diamonds" },
  { rank: "6", suit: "spades" },
  { rank: "2", suit: "hearts" },
  { rank: "Q", suit: "clubs" },
];

const handRanks: HandRank[] = [
  {
    name: "High Card",
    english: "High Card",
    strength: 1,
    short: "Keine Kombination. Die höchste Karte zählt.",
    explanation:
      "Wenn niemand ein Paar oder besser hat, gewinnt die höchste einzelne Karte. Danach werden die nächsten Karten verglichen.",
    example: [
      { rank: "A", suit: "spades" },
      { rank: "J", suit: "hearts" },
      { rank: "9", suit: "clubs" },
      { rank: "6", suit: "diamonds" },
      { rank: "2", suit: "spades" },
    ],
    note: "Ass hoch schlägt König hoch.",
  },
  {
    name: "One Pair",
    english: "Pair",
    strength: 2,
    short: "Zwei Karten mit gleichem Wert.",
    explanation:
      "Ein Paar besteht aus zwei gleich hohen Karten. Bei gleichen Paaren entscheiden die Beikarten, die Kicker.",
    example: [
      { rank: "9", suit: "spades" },
      { rank: "9", suit: "hearts" },
      { rank: "A", suit: "clubs" },
      { rank: "7", suit: "diamonds" },
      { rank: "4", suit: "spades" },
    ],
    note: "Paar Neunen mit Ass-Kicker.",
  },
  {
    name: "Two Pair",
    english: "Two Pair",
    strength: 3,
    short: "Zwei verschiedene Paare.",
    explanation:
      "Zuerst wird das höhere Paar verglichen, dann das zweite Paar, danach der einzelne Kicker.",
    example: [
      { rank: "K", suit: "spades" },
      { rank: "K", suit: "hearts" },
      { rank: "7", suit: "clubs" },
      { rank: "7", suit: "diamonds" },
      { rank: "3", suit: "spades" },
    ],
    note: "Könige und Siebenen.",
  },
  {
    name: "Three of a Kind",
    english: "Drilling",
    strength: 4,
    short: "Drei Karten mit gleichem Wert.",
    explanation:
      "Ein Drilling ist stärker als zwei Paare. Zwei übrige Karten dienen als Kicker.",
    example: [
      { rank: "Q", suit: "spades" },
      { rank: "Q", suit: "hearts" },
      { rank: "Q", suit: "clubs" },
      { rank: "8", suit: "diamonds" },
      { rank: "2", suit: "spades" },
    ],
    note: "Drei Damen.",
  },
  {
    name: "Straight",
    english: "Straße",
    strength: 5,
    short: "Fünf aufeinanderfolgende Werte.",
    explanation:
      "Die Farben sind egal. Das Ass kann ganz oben stehen oder bei A-2-3-4-5 als niedrigste Karte zählen.",
    example: [
      { rank: "10", suit: "spades" },
      { rank: "J", suit: "hearts" },
      { rank: "Q", suit: "clubs" },
      { rank: "K", suit: "diamonds" },
      { rank: "A", suit: "spades" },
    ],
    note: "10 bis Ass ist die höchste Straße.",
  },
  {
    name: "Flush",
    english: "Flush",
    strength: 6,
    short: "Fünf Karten derselben Farbe.",
    explanation:
      "Beim Flush müssen die Karten nicht aufeinanderfolgen. Wenn mehrere Spieler Flush haben, zählt die höchste Flush-Karte.",
    example: [
      { rank: "A", suit: "hearts" },
      { rank: "J", suit: "hearts" },
      { rank: "8", suit: "hearts" },
      { rank: "5", suit: "hearts" },
      { rank: "2", suit: "hearts" },
    ],
    note: "Alle fünf Karten sind Herz.",
  },
  {
    name: "Full House",
    english: "Full House",
    strength: 7,
    short: "Drilling plus ein Paar.",
    explanation:
      "Beim Vergleich zählt zuerst der Drilling. Ein Full House mit drei Assen schlägt ein Full House mit drei Königen.",
    example: [
      { rank: "10", suit: "spades" },
      { rank: "10", suit: "hearts" },
      { rank: "10", suit: "clubs" },
      { rank: "4", suit: "diamonds" },
      { rank: "4", suit: "spades" },
    ],
    note: "Zehnen voll mit Vieren.",
  },
  {
    name: "Four of a Kind",
    english: "Vierling",
    strength: 8,
    short: "Vier Karten mit gleichem Wert.",
    explanation:
      "Ein Vierling ist sehr selten und schlägt Full House, Flush und Straight.",
    example: [
      { rank: "6", suit: "spades" },
      { rank: "6", suit: "hearts" },
      { rank: "6", suit: "clubs" },
      { rank: "6", suit: "diamonds" },
      { rank: "K", suit: "spades" },
    ],
    note: "Vier Sechsen.",
  },
  {
    name: "Straight Flush",
    english: "Straight Flush",
    strength: 9,
    short: "Straße in derselben Farbe.",
    explanation:
      "Fünf aufeinanderfolgende Karten derselben Farbe. Die stärkste Variante ist der Royal Flush.",
    example: [
      { rank: "5", suit: "clubs" },
      { rank: "6", suit: "clubs" },
      { rank: "7", suit: "clubs" },
      { rank: "8", suit: "clubs" },
      { rank: "9", suit: "clubs" },
    ],
    note: "5 bis 9 in Kreuz.",
  },
  {
    name: "Royal Flush",
    english: "Royal Flush",
    strength: 10,
    short: "Die höchste mögliche Pokerhand.",
    explanation:
      "10, Bube, Dame, König und Ass in derselben Farbe. Diese Hand kann nicht geschlagen werden.",
    example: [
      { rank: "10", suit: "spades" },
      { rank: "J", suit: "spades" },
      { rank: "Q", suit: "spades" },
      { rank: "K", suit: "spades" },
      { rank: "A", suit: "spades" },
    ],
    note: "Die Spitzenhand.",
  },
];

const stages: Stage[] = [
  {
    name: "Preflop",
    cards: [],
    pot: 3,
    action:
      "Alle erhalten zwei verdeckte Hole Cards. Small Blind und Big Blind liegen bereits im Pot.",
    teacherNote: "Erste Entscheidung: einsteigen, erhöhen oder aussteigen.",
  },
  {
    name: "Flop",
    cards: boardCards.slice(0, 3),
    pot: 9,
    action:
      "Drei Community Cards werden offen ausgelegt. Alle Spieler kombinieren sie mit ihren Hole Cards.",
    teacherNote: "Jetzt sieht man erste Draws: zum Beispiel Flush Draw oder Straight Draw.",
  },
  {
    name: "Turn",
    cards: boardCards.slice(0, 4),
    pot: 18,
    action:
      "Die vierte Community Card kommt dazu. Wieder folgt eine Setzrunde.",
    teacherNote: "Turn-Entscheidungen sind oft teuer, weil nur noch eine Karte kommt.",
  },
  {
    name: "River",
    cards: boardCards,
    pot: 36,
    action:
      "Die fünfte und letzte Community Card liegt offen. Danach gibt es die letzte Setzrunde.",
    teacherNote: "Ab jetzt steht die beste Fünf-Karten-Hand fest.",
  },
  {
    name: "Showdown",
    cards: boardCards,
    pot: 36,
    action:
      "Wenn nach der letzten Setzrunde noch mehrere Spieler dabei sind, werden die Karten gezeigt.",
    teacherNote: "Gewertet wird immer die beste Kombination aus fünf von sieben Karten.",
  },
];

const actions: ActionInfo[] = [
  {
    name: "Check",
    description: "Ohne Einsatz weitergeben, wenn noch niemand gesetzt hat.",
    example: "Alle checken am Flop: Die nächste Karte wird aufgedeckt.",
  },
  {
    name: "Bet",
    description: "Einen ersten Einsatz in einer Setzrunde machen.",
    example: "Im Pot liegen 9 Chips, eine Bet von 6 Chips baut Druck auf.",
  },
  {
    name: "Call",
    description: "Den aktuellen Einsatz mitgehen.",
    example: "Jemand setzt 6 Chips, du zahlst 6 Chips, um in der Hand zu bleiben.",
  },
  {
    name: "Raise",
    description: "Einen bestehenden Einsatz erhöhen.",
    example: "Aus einer Bet von 6 Chips wird ein Raise auf 18 Chips.",
  },
  {
    name: "Fold",
    description: "Aussteigen und die aktuelle Hand aufgeben.",
    example: "Du verlierst keine weiteren Chips, kannst den Pot aber nicht mehr gewinnen.",
  },
  {
    name: "All-in",
    description: "Alle eigenen Chips setzen. Im No Limit ist das jederzeit als Einsatz möglich.",
    example: "Bei 42 Chips Rest kann ein Spieler alle 42 Chips setzen.",
  },
];

function PlayingCardView({ card }: { card: PlayingCard }) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";

  return (
    <span className={`playing-card ${isRed ? "red" : "black"}`}>
      <span>{card.rank}</span>
      <span>{suitLabels[card.suit]}</span>
    </span>
  );
}

function CardRow({ cards, emptyLabel }: { cards: PlayingCard[]; emptyLabel?: string }) {
  if (cards.length === 0) {
    return <div className="empty-cards">{emptyLabel ?? "Noch keine Community Cards"}</div>;
  }

  return (
    <div className="card-row">
      {cards.map((card, index) => (
        <PlayingCardView key={`${card.rank}-${card.suit}-${index}`} card={card} />
      ))}
    </div>
  );
}

function ChipStack({ amount }: { amount: number }) {
  return (
    <div className="chip-stack" aria-label={`Pot mit ${amount} Chips`}>
      <span className="chip chip-a" />
      <span className="chip chip-b" />
      <span className="chip chip-c" />
      <strong>{amount}</strong>
    </div>
  );
}

function App() {
  const [activeRankIndex, setActiveRankIndex] = useState(5);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeAction, setActiveAction] = useState(actions[1].name);

  const activeRank = handRanks[activeRankIndex];
  const activeStage = stages[activeStageIndex];
  const selectedAction = useMemo(
    () => actions.find((action) => action.name === activeAction) ?? actions[0],
    [activeAction],
  );

  return (
    <main>
      <section className="hero" id="start">
        <nav className="top-nav" aria-label="Hauptnavigation">
          <a href="#start">Start</a>
          <a href="#haende">Hände</a>
          <a href="#ablauf">Ablauf</a>
          <a href="#setzen">Setzen</a>
        </nav>

        <div className="hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Texas Hold'em No Limit</p>
            <h1>Poker-Regeln interaktiv verstehen</h1>
            <p>
              Eine Unterrichts-App für die Grundlagen: Hole Cards, Community Cards,
              Hand-Rankings, Setzrunden und typische Aktionen am Tisch.
            </p>
            <div className="hero-actions">
              <a className="primary-link" href="#haende">
                Hände lernen
              </a>
              <a className="secondary-link" href="#ablauf">
                Runde ansehen
              </a>
            </div>
          </div>

          <div className="table-scene" aria-label="Poker-Tisch Beispiel">
            <div className="felt">
              <div className="pot-area">
                <ChipStack amount={18} />
                <span>Beispielpot</span>
              </div>
              <div className="board-area">
                <p>Community Cards</p>
                <CardRow cards={boardCards.slice(0, 3)} />
              </div>
              <div className="hand-area">
                <p>Deine Hole Cards</p>
                <CardRow cards={heroCards} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overview-band" aria-label="Grundidee">
        <div className="overview-item">
          <strong>2</strong>
          <span>Hole Cards pro Spieler</span>
        </div>
        <div className="overview-item">
          <strong>5</strong>
          <span>Community Cards auf dem Board</span>
        </div>
        <div className="overview-item">
          <strong>5 aus 7</strong>
          <span>Beste Hand gewinnt den Pot</span>
        </div>
      </section>

      <section className="section" id="haende">
        <div className="section-heading">
          <p className="eyebrow">Hand-Ranking</p>
          <h2>Welche Hand schlägt welche?</h2>
          <p>
            Klicke eine Hand an. Die Liste ist von schwach nach stark sortiert, damit
            Schüler die Reihenfolge schnell wiederholen können.
          </p>
        </div>

        <div className="rank-layout">
          <div className="rank-list" role="list" aria-label="Pokerhände">
            {handRanks.map((rank, index) => (
              <button
                className={`rank-button ${index === activeRankIndex ? "active" : ""}`}
                key={rank.name}
                onClick={() => setActiveRankIndex(index)}
                type="button"
              >
                <span>{rank.strength}</span>
                <strong>{rank.name}</strong>
                <small>{rank.short}</small>
              </button>
            ))}
          </div>

          <article className="detail-panel">
            <div className="panel-topline">
              <span>Stärke {activeRank.strength} von 10</span>
              <span>{activeRank.english}</span>
            </div>
            <h3>{activeRank.name}</h3>
            <CardRow cards={activeRank.example} />
            <p>{activeRank.explanation}</p>
            <div className="teacher-note">
              <strong>Merksatz</strong>
              <span>{activeRank.note}</span>
            </div>
          </article>
        </div>
      </section>

      <section className="section table-section" id="ablauf">
        <div className="section-heading">
          <p className="eyebrow">Rundenablauf</p>
          <h2>Von Preflop bis Showdown</h2>
          <p>
            Texas Hold'em läuft in festen Phasen. Nach jeder Kartenphase kann gesetzt
            werden, solange noch mehrere Spieler in der Hand sind.
          </p>
        </div>

        <div className="stage-controls" role="tablist" aria-label="Setzrunden">
          {stages.map((stage, index) => (
            <button
              className={index === activeStageIndex ? "active" : ""}
              key={stage.name}
              onClick={() => setActiveStageIndex(index)}
              type="button"
            >
              {stage.name}
            </button>
          ))}
        </div>

        <div className="stage-view">
          <div className="mini-table">
            <div className="mini-pot">
              <ChipStack amount={activeStage.pot} />
              <span>Pot in Chips</span>
            </div>
            <div>
              <p className="mini-label">Deine Karten</p>
              <CardRow cards={heroCards} />
            </div>
            <div>
              <p className="mini-label">Board</p>
              <CardRow cards={activeStage.cards} />
            </div>
          </div>

          <article className="stage-copy">
            <span className="stage-badge">{activeStage.name}</span>
            <h3>{activeStage.action}</h3>
            <p>{activeStage.teacherNote}</p>
          </article>
        </div>
      </section>

      <section className="section" id="setzen">
        <div className="section-heading">
          <p className="eyebrow">No-Limit Betting</p>
          <h2>Aktionen am Tisch</h2>
          <p>
            No Limit bedeutet: Es gibt kein fixes Einsatzlimit. Spieler können kleine
            Einsätze machen, stark erhöhen oder alle Chips setzen.
          </p>
        </div>

        <div className="action-layout">
          <div className="action-grid">
            {actions.map((action) => (
              <button
                className={`action-button ${action.name === activeAction ? "active" : ""}`}
                key={action.name}
                onClick={() => setActiveAction(action.name)}
                type="button"
              >
                {action.name}
              </button>
            ))}
          </div>

          <article className="betting-panel">
            <div className="betting-example">
              <ChipStack amount={24} />
              <div className="bet-line">
                <span>Spieler A</span>
                <strong>{selectedAction.name}</strong>
              </div>
            </div>
            <h3>{selectedAction.description}</h3>
            <p>{selectedAction.example}</p>
            <div className="teacher-note">
              <strong>Unterrichtshinweis</strong>
              <span>
                Betonen: Einsätze sind hier nur Zählchips zum Lernen, nicht echtes Geld.
              </span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

export default App;
