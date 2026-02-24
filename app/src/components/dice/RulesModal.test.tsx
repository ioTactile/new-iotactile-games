import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RulesModal } from "./RulesModal";

describe("RulesModal", () => {
  it("n'affiche pas le dialogue quand open est false", () => {
    render(<RulesModal open={false} onClose={() => {}} />);
    expect(
      screen.queryByRole("dialog", { name: /règles du jeu/i }),
    ).not.toBeInTheDocument();
  });

  it("affiche le dialogue des règles quand open est true", () => {
    render(<RulesModal open onClose={() => {}} />);
    expect(
      screen.getByRole("dialog", { name: /règles du jeu/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/NOMBRE DE 1/)).toBeInTheDocument();
    expect(screen.getByText(/BRELAN/)).toBeInTheDocument();
    expect(screen.getByText(/BONUS \+35/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /fermer les règles/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /compris/i }),
    ).toBeInTheDocument();
  });

  it("appelle onClose au clic sur le bouton X", () => {
    const onClose = vi.fn();
    render(<RulesModal open onClose={onClose} />);
    const closeButtons = screen.getAllByRole("button", {
      name: /fermer les règles/i,
    });
    fireEvent.click(closeButtons[closeButtons.length - 1]!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("appelle onClose au clic sur COMPRIS !", () => {
    const onClose = vi.fn();
    render(<RulesModal open onClose={onClose} />);
    const comprisButtons = screen.getAllByRole("button", { name: /compris/i });
    fireEvent.click(comprisButtons[comprisButtons.length - 1]!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("affiche un overlay quand la modale est ouverte", () => {
    render(<RulesModal open onClose={() => {}} />);
    const overlays = document.querySelectorAll('[data-slot="dialog-overlay"]');
    expect(overlays.length).toBeGreaterThan(0);
  });

  it("ferme au clé Escape quand la modale est ouverte", () => {
    const onClose = vi.fn();
    render(<RulesModal open onClose={onClose} />);
    const dialog = screen.getByRole("dialog", { name: /règles du jeu/i });
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
