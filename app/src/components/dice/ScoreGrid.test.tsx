import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreGrid } from "./ScoreGrid";

describe("ScoreGrid", () => {
  it("n'affiche pas de propositions de score quand aucun dé n'a encore été lancé", () => {
    render(
      <ScoreGrid
        players={[{ id: "p1", name: "Alice" }]}
        currentPlayerId="p1"
        scoresByPlayer={{}}
        // Simule l'état avant tout roll : le parent passe un tableau vide
        dices={[]}
        onChooseScore={() => {}}
        canChoose
      />,
    );

    // On vérifie qu'au moins une cellule de score affiche "—" (pas de valeur proposée)
    // pour le joueur courant.
    const cells = screen.getAllByText("—");
    expect(cells.length).toBeGreaterThan(0);
  });
});

