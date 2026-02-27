export class Cell {
  private isMine: boolean;
  private isMineClicked: boolean;
  private isRevealed: boolean;
  private isFlagged: boolean;
  private numAdjacentMines: number;

  constructor() {
    this.isMine = false;
    this.isMineClicked = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.numAdjacentMines = 0;
  }

  public getIsMine(): boolean {
    return this.isMine;
  }

  public setIsMine(isMine: boolean): void {
    this.isMine = isMine;
  }

  public getIsMineClicked(): boolean {
    return this.isMineClicked;
  }

  public setIsMineClicked(isMineClicked: boolean): void {
    this.isMineClicked = isMineClicked;
  }

  public getIsRevealed(): boolean {
    return this.isRevealed;
  }

  public setIsRevealed(isRevealed: boolean): void {
    this.isRevealed = isRevealed;
  }

  public getIsFlagged(): boolean {
    return this.isFlagged;
  }

  public setIsFlagged(isFlagged: boolean): void {
    this.isFlagged = isFlagged;
  }

  public getNumAdjacentMines(): number {
    return this.numAdjacentMines;
  }

  public setNumAdjacentMines(numAdjacentMines: number): void {
    this.numAdjacentMines = numAdjacentMines;
  }
}
