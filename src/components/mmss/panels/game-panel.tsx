"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface GameState {
  round: number;
  score: number;
  difficulty: string;
  playerHealth: number;
  aiHealth: number;
  lastEvent: string;
}

export function GamePanel() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    round: 0,
    score: 0,
    difficulty: "Normal",
    playerHealth: 100,
    aiHealth: 100,
    lastEvent: "Start a new game to begin!",
  });

  const difficulties = ["Easy", "Normal", "Hard"];
  const gameTypes = [
    { name: "Semantic Duel", icon: "⚔️", desc: "Battle with semantic constructs" },
    { name: "Pattern Match", icon: "🔍", desc: "Find hidden patterns" },
    { name: "Context Builder", icon: "🏗️", desc: "Build semantic contexts" },
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameState({
      round: 1,
      score: 0,
      difficulty: "Normal",
      playerHealth: 100,
      aiHealth: 100,
      lastEvent: "Game started! Choose your action.",
    });
  };

  const takeAction = (action: string) => {
    const playerDmg = Math.floor(Math.random() * 15) + 5;
    const aiDmg = Math.floor(Math.random() * 10) + 3;

    setGameState((prev) => {
      const newAiHealth = Math.max(0, prev.aiHealth - playerDmg);
      const newPlayerHealth = Math.max(0, prev.playerHealth - aiDmg);
      const isWin = newAiHealth <= 0;
      const isLose = newPlayerHealth <= 0;

      return {
        ...prev,
        round: prev.round + 1,
        score: isWin ? prev.score + 100 : prev.score,
        playerHealth: newPlayerHealth,
        aiHealth: newAiHealth,
        lastEvent: isWin
          ? `You win! ${action} dealt ${playerDmg} damage. Final score: ${prev.score + 100}`
          : isLose
          ? `AI wins! ${action} dealt ${playerDmg} but AI dealt ${aiDmg}.`
          : `${action} dealt ${playerDmg} damage. AI countered with ${aiDmg} damage.`,
      };
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9] overflow-y-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎮</span>
          <div>
            <h2 className="text-sm font-semibold text-white">MMSS Game</h2>
            <p className="text-[10px] text-[#8b949e]">
              Semantic Game Engine
            </p>
          </div>
        </div>
        {gameStarted && (
          <span className="text-[10px] text-[#8b949e]">
            Round {gameState.round} | Score: {gameState.score}
          </span>
        )}
      </div>

      {!gameStarted ? (
        /* Game Selection */
        <div className="space-y-3">
          <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider">
            Select Game Mode
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {gameTypes.map((game) => (
              <div
                key={game.name}
                className="rounded-lg bg-[#161b22] border border-[#30363d] p-3 hover:border-emerald-500/30 transition-colors cursor-pointer"
                onClick={startGame}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{game.icon}</span>
                  <span className="text-[12px] font-semibold text-white">
                    {game.name}
                  </span>
                </div>
                <p className="text-[10px] text-[#8b949e]">{game.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider mb-2">
              Difficulty
            </h3>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  className={`px-3 py-1 rounded-md text-[11px] border transition-colors ${
                    gameState.difficulty === d
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                      : "border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                  }`}
                  onClick={() =>
                    setGameState((p) => ({ ...p, difficulty: d }))
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={startGame}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] h-8 mt-4"
          >
            Start Game
          </Button>
        </div>
      ) : (
        /* Active Game */
        <div className="space-y-3">
          {/* Health bars */}
          <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-semibold text-emerald-400">
                Player
              </span>
              <span className="text-[11px] font-mono text-white">
                {gameState.playerHealth} HP
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0d1117] mb-3">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${gameState.playerHealth}%` }}
              />
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-semibold text-red-400">
                AI Opponent
              </span>
              <span className="text-[11px] font-mono text-white">
                {gameState.aiHealth} HP
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0d1117]">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-300"
                style={{ width: `${gameState.aiHealth}%` }}
              />
            </div>
          </div>

          {/* Event log */}
          <div className="rounded-lg bg-[#161b22] border border-[#30363d] p-3">
            <p className="text-[11px] text-[#c9d1d9]">{gameState.lastEvent}</p>
          </div>

          {/* Actions */}
          {gameState.playerHealth > 0 && gameState.aiHealth > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => takeAction("Semantic Attack")}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8"
              >
                ⚔️ Attack
              </Button>
              <Button
                onClick={() => takeAction("Context Defense")}
                size="sm"
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] h-8"
              >
                🛡️ Defend
              </Button>
              <Button
                onClick={() => takeAction("Pattern Analysis")}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white text-[11px] h-8"
              >
                🔍 Analyze
              </Button>
              <Button
                onClick={() => takeAction("Fractal Power")}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white text-[11px] h-8"
              >
                🌟 Special
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setGameStarted(false);
                setGameState((p) => ({
                  ...p,
                  playerHealth: 100,
                  aiHealth: 100,
                  lastEvent: "Game over! Start a new game.",
                }));
              }}
              className="w-full bg-[#30363d] hover:bg-[#484f58] text-white text-[12px] h-8"
            >
              New Game
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
