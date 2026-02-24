import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";
import Home from "./page";
import { games } from "@/lib/games";

vi.mock("@/hooks/use-auth");

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      userLoading: false,
      userError: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true,
      loginMutation: {} as never,
      registerMutation: {} as never,
      logoutMutation: {} as never,
    });
  });

  it("affiche le titre et la liste des jeux", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /choisissez un jeu/i }),
    ).toBeInTheDocument();
    for (const game of games) {
      const link = screen.getByRole("link", { name: new RegExp(game.name, "i") });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", game.href);
    }
  });

  it("affiche le bouton Se connecter quand l'utilisateur n'est pas connecté", () => {
    render(<Home />);
    const buttons = screen.getAllByRole("button", { name: /se connecter/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    expect(buttons[0]).toBeInTheDocument();
  });

  it("affiche le menu utilisateur quand l'utilisateur est connecté", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: "u1",
        email: "u@test.com",
        username: "TestUser",
        role: "USER",
        createdAt: "",
        updatedAt: "",
        deletedAt: null,
      },
      userLoading: false,
      userError: null,
      accessToken: "token",
      isAuthenticated: true,
      isInitialized: true,
      loginMutation: {} as never,
      registerMutation: {} as never,
      logoutMutation: {} as never,
    });
    render(<Home />);
    expect(screen.getByText("TestUser")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /déconnexion/i })).toBeInTheDocument();
  });
});
