import React, { useState, useEffect } from 'react';

// Define initial groups
const initialGroups = Object.entries({
  A: { teams: ['Al Ahly SC', 'FC Porto', 'Inter Miami CF', 'Palmeiras'], first: '', second: '' },
  B: { teams: ['Atletico Madrid', 'Botafogo RJ', 'Paris Saint-Germain', 'Seattle Sounders FC'], first: '', second: '' },
  C: { teams: ['Auckland City FC', 'Bayern München', 'Benfica', 'Boca Juniors'], first: '', second: '' },
  D: { teams: ['Chelsea', 'Espérance', 'Flamengo', 'Leon'], first: '', second: '' },
  E: { teams: ['Inter', 'Monterrey', 'River Plate', 'Urawa Red Diamonds'], first: '', second: '' },
  F: { teams: ['Borussia Dortmund', 'Fluminense', 'Mamelodi Sundowns FC', 'Ulsan HD FC'], first: '', second: '' },
  G: { teams: ['Al-Ain', 'Juventus', 'Manchester City', 'Wydad Casablanca'], first: '', second: '' },
  H: { teams: ['Al Hilal', 'Pachuca', 'Real Madrid', 'Salzburg'], first: '', second: '' },
}).map(([key, value]) => ({
  name: `Group ${key}`,
  ...value
}));

// Each knockout round is an array of match objects: { team1, team2, winner }
const initialKnockout = {
  roundOf16: Array(8).fill(null).map(() => ({ team1: null, team2: null, winner: null })),
  quarterfinals: Array(4).fill(null).map(() => ({ team1: null, team2: null, winner: null })),
  semifinals: Array(2).fill(null).map(() => ({ team1: null, team2: null, winner: null })),
  final: { team1: null, team2: null, winner: null },
};

// Helper: update a match while preserving the winner if still valid
function updateMatch(oldMatch, newTeam1, newTeam2) {
  let winner = oldMatch && oldMatch.winner;
  if (winner && winner !== newTeam1 && winner !== newTeam2) {
    winner = null;
  }
  return { team1: newTeam1, team2: newTeam2, winner };
}

// Recalculate subsequent knockout rounds based on previous round winners
function recalcKnockouts(knockouts) {
  const newKnockouts = { ...knockouts };

  // Quarterfinals: R16 matches (0 & 1) feed QF match 0, (2 & 3) feed QF match 1, etc.
  const r16 = newKnockouts.roundOf16;
  const qf = [...newKnockouts.quarterfinals];
  for (let i = 0; i < 4; i++) {
    const matchA = r16[i * 2];
    const matchB = r16[i * 2 + 1];
    const team1 = matchA?.winner || null;
    const team2 = matchB?.winner || null;
    qf[i] = updateMatch(qf[i], team1, team2);
  }
  newKnockouts.quarterfinals = qf;

  // Semifinals: QF matches (0 & 1) feed SF match 0, (2 & 3) feed SF match 1.
  const sf = [...newKnockouts.semifinals];
  for (let i = 0; i < 2; i++) {
    const matchA = qf[i * 2];
    const matchB = qf[i * 2 + 1];
    const team1 = matchA?.winner || null;
    const team2 = matchB?.winner || null;
    sf[i] = updateMatch(sf[i], team1, team2);
  }
  newKnockouts.semifinals = sf;

  // Final: SF match winners feed the final.
  const f = newKnockouts.final;
  const team1 = sf[0]?.winner || null;
  const team2 = sf[1]?.winner || null;
  newKnockouts.final = updateMatch(f, team1, team2);

  return newKnockouts;
}

function App() {
  const [groups, setGroups] = useState(initialGroups);
  const [winners, setWinners] = useState(initialKnockout);

  // When all groups have their 1st and 2nd teams selected, set up Round of 16
  // Update the useEffect for roundOf16
  useEffect(() => {
  const qualifiedTeams = groups.map(group => [group.first, group.second]);
  const [A, B, C, D, E, F, G, H] = qualifiedTeams;
  
  const newRoundOf16 = [
    { team1: A[0] || null, team2: B[1] || null, winner: null },
    { team1: C[0] || null, team2: D[1] || null, winner: null },
    { team1: E[0] || null, team2: F[1] || null, winner: null },
    { team1: G[0] || null, team2: H[1] || null, winner: null },
    { team1: B[0] || null, team2: A[1] || null, winner: null },
    { team1: D[0] || null, team2: C[1] || null, winner: null },
    { team1: F[0] || null, team2: E[1] || null, winner: null },
    { team1: H[0] || null, team2: G[1] || null, winner: null },
  ];

  setWinners(prev => {
    // Preserve existing winners where possible
    const updatedRoundOf16 = prev.roundOf16.map((oldMatch, i) => ({
      ...oldMatch,
      team1: newRoundOf16[i].team1 || oldMatch.team1,
      team2: newRoundOf16[i].team2 || oldMatch.team2,
      winner: oldMatch.winner && [newRoundOf16[i].team1, newRoundOf16[i].team2].includes(oldMatch.winner) 
        ? oldMatch.winner 
        : null
    }));
    
    return recalcKnockouts({ ...prev, roundOf16: updatedRoundOf16 });
  });
}, [groups]); // Trigger on any group change

  // Group stage selection handler
  const handleGroupSelect = (groupIndex, position, team) => {
    setGroups(prev => {
      const updated = [...prev];
      updated[groupIndex][position] = team;
      return updated;
    });
  };

  // Handle knockout match winner selection (for R16, QF, SF)
  const handleSelectWinner = (round, matchIndex, team) => {
    setWinners(prev => {
      const updatedRound = [...prev[round]];
      updatedRound[matchIndex] = { ...updatedRound[matchIndex], winner: team };
      const newKnockouts = { ...prev, [round]: updatedRound };
      return recalcKnockouts(newKnockouts);
    });
  };

  // Final match winner selection
  const handleSelectFinalWinner = (team) => {
    setWinners(prev => {
      const newFinal = { ...prev.final, winner: team };
      return { ...prev, final: newFinal };
    });
  };

  // Define positions for each round (adjust as needed)
  const bracketPositions = {
    roundOf16: [
      { x: 100, y: 100 }, { x: 100, y: 250 }, { x: 100, y: 400 }, { x: 100, y: 550 },
      { x: 1100, y: 100 }, { x: 1100, y: 250 }, { x: 1100, y: 400 }, { x: 1100, y: 550 },
    ],
    quarterfinals: [
      { x: 300, y: 175 }, { x: 300, y: 475 },
      { x: 900, y: 175 }, { x: 900, y: 475 },
    ],
    semifinals: [
      { x: 400, y: 325 }, { x: 800, y: 325 },
    ],
    final: [
      { x: 600, y: 325 },
    ],
  };

  // Render a match box (for R16, QF, SF)
  const renderMatch = (round, index) => {
    const match = winners[round][index];
    const pos = bracketPositions[round][index];
    if (!match) return null;
    return (
      <div
        key={`${round}-${index}`}
        className="match"
        style={{ left: pos.x, top: pos.y }}
      >
        <button
          onClick={() => match.team1 && handleSelectWinner(round, index, match.team1)}
          className={`team ${match.winner === match.team1 ? 'winner' : ''}`}
        >
          {match.team1 || 'TBD'}
        </button>
        <button
          onClick={() => match.team2 && handleSelectWinner(round, index, match.team2)}
          className={`team ${match.winner === match.team2 ? 'winner' : ''}`}
        >
          {match.team2 || 'TBD'}
        </button>
      </div>
    );
  };

  // Render the final match and, if selected, the Champion label below it
  const renderFinal = () => {
    const pos = bracketPositions.final[0];
    const f = winners.final;
    return (
      <>
        <div className="match" style={{ left: pos.x, top: pos.y }}>
          {f.team1 && f.team2 ? (
            <>
              <button
                onClick={() => handleSelectFinalWinner(f.team1)}
                className={`team ${f.winner === f.team1 ? 'winner' : ''}`}
              >
                {f.team1}
              </button>
              <button
                onClick={() => handleSelectFinalWinner(f.team2)}
                className={`team ${f.winner === f.team2 ? 'winner' : ''}`}
              >
                {f.team2}
              </button>
            </>
          ) : (
            <div className="team">Champion</div>
          )}
        </div>
        {f.winner && (
          <div className="champion" style={{ left: pos.x, top: pos.y + 80 }}>
            Champion - {f.winner}
          </div>
        )}
      </>
    );
  };

  // --- ARROWS SECTION --- //
  // Mapping for which matches feed into the next round
  const nextRoundMap = {
    roundOf16: {
      next: 'quarterfinals',
      pairs: [
        [0, 0], [1, 0],
        [2, 1], [3, 1],
        [4, 2], [5, 2],
        [6, 3], [7, 3],
      ],
    },
    quarterfinals: {
      next: 'semifinals',
      pairs: [
        [0, 0], [1, 0],
        [2, 1], [3, 1],
      ],
    },
    semifinals: {
      next: 'final',
      pairs: [
        [0, 0], [1, 0],
      ],
    },
  };

  // Helper functions for edge positions based on .match width (now 100px, half = 50px)
  function getRightEdge(pos) {
    return { x: pos.x + 50, y: pos.y };
  }
  function getLeftEdge(pos) {
    return { x: pos.x - 50, y: pos.y };
  }
  function getCenter(pos) {
    return { x: pos.x, y: pos.y };
  }

  // Render SVG lines with arrowheads connecting rounds
  const renderLines = () => {
    const lines = [];
    for (const round in nextRoundMap) {
      const { next, pairs } = nextRoundMap[round];
      pairs.forEach(([fromIndex, toIndex]) => {
        const fromPos = bracketPositions[round][fromIndex];
        const toPos = bracketPositions[next][toIndex];
        if (!fromPos || !toPos) return;
        // For rounds on the left side, use right edge; for the right side, use left edge.
        const start = (round === 'roundOf16' || round === 'quarterfinals')
          ? getRightEdge(fromPos)
          : getCenter(fromPos);
        const end = getLeftEdge(toPos);
        lines.push(
          <line
            key={`${round}-${fromIndex}-to-${next}-${toIndex}`}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="#FFD700"
            strokeWidth="2"
            markerEnd="url(#arrow)"
          />
        );
      });
    }
    return lines;
  };

  return (
    <div className="app">
      <h1>CLub World Cup 2025</h1>
      
      {/* GROUP STAGE */}
      <div className="group-stage">
        <h2>Group Stage</h2>
        <div className="groups-grid">
          {groups.map((group, gIndex) => (
            <div key={group.name} className="group">
              <h3>{group.name}</h3>
              <div className="selectors">
                <select
                  value={group.first}
                  onChange={(e) => handleGroupSelect(gIndex, 'first', e.target.value)}
                >
                  <option value="">Select 1st</option>
                  {group.teams
                    .filter(t => t !== group.second)
                    .map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                </select>
                <select
                  value={group.second}
                  onChange={(e) => handleGroupSelect(gIndex, 'second', e.target.value)}
                >
                  <option value="">Select 2nd</option>
                  {group.teams
                    .filter(t => t !== group.first)
                    .map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KNOCKOUT BRACKET */}
      <h2>Knockout Bracket</h2>
      <div className="bracket-container">
        {/* SVG for arrow lines (behind match boxes) */}
        <svg width="1200" height="900" className="bracket-lines">
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#FFD700" />
            </marker>
          </defs>
          {renderLines()}
        </svg>

        {/* Render match boxes */}
        {winners.roundOf16.map((_, i) => renderMatch('roundOf16', i))}
        {winners.quarterfinals.map((_, i) => renderMatch('quarterfinals', i))}
        {winners.semifinals.map((_, i) => renderMatch('semifinals', i))}
        {renderFinal()}
      </div>
    </div>
  );
}

// Updated CSS styles: black background, and all text, match borders, and lines in gold.
const styles = `
.app {
  background-color: black;
  color: #FFD700;
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}
.group-stage {
  margin-bottom: 40px;
}
.groups-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.group {
  border: 1px solid #FFD700;
  padding: 15px;
  border-radius: 8px;
  background: black;
}
.selectors {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
select {
  padding: 8px;
  border: 1px solid #FFD700;
  border-radius: 4px;
  font-size: 14px;
  background: black;
  color: #FFD700;
}
.bracket-container {
  position: relative;
  width: 1200px;
  height: 620px;
  border: 2px solid #FFD700;
  margin-top: 20px;
}
.bracket-lines {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.match {
  position: absolute;
  width: 100px;
  padding: 10px;
  background: black;
  border: 2px solid #FFD700;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translate(-50%, -50%);
  z-index: 2;
}
.match button {
  margin: 5px 0;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  background: black;
  border: 1px solid #FFD700;
  color: #FFD700;
}
.team.winner {
  background:rgb(21, 255, 0);
  color: black;
}
.champion {
  position: absolute;
  font-size: 18px;
  font-weight: bold;
  color: #FFD700;
  transform: translate(-50%, -50%);
  z-index: 3;
}
h1, h2, h3 {
  color: #FFD700;
}
`;

document.head.insertAdjacentHTML('beforeend', `<style>${styles}</style>`);

export default App;
