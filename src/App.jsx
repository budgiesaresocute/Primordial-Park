import "./App.css";

export default function App() {
  return (
    <div className="game">
      <header className="topbar">
        <div>🪙 Coins: 10,000</div>
        <div>🧬 DNA: 400</div>
        <div>💵 Cash: 50</div>
        <div>🌽 Food: 5,000</div>
        <div>⭐ Level: 1</div>
      </header>

      <main className="park">
        <h1>PRIMORDIAL PARK</h1>
        <p>3D Park View Coming Next</p>
      </main>

      <aside className="sidebar">
        <button>Dinosaurs</button>
        <button>Buildings</button>
        <button>Decorations</button>
        <button>Battle</button>
        <button>Market</button>
      </aside>
    </div>
  );
}