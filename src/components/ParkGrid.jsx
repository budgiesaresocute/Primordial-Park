export default function ParkGrid() {
  const tiles = [];

  for (let i = 0; i < 400; i++) {
    tiles.push(
      <div key={i} className="tile"></div>
    );
  }

  return (
    <div className="park-grid">
      {tiles}
    </div>
  );
}