import { registerPlugin } from '@capacitor/core';

export interface PlayGamesSignInResult {
  playerId: string;
  displayName: string;
  serverAuthCode: string | null;
}

export interface PlayGamesAuthResult {
  isAuthenticated: boolean;
}

export interface PlayGamesPlugin {
  isAuthenticated(): Promise<PlayGamesAuthResult>;
  signIn(): Promise<PlayGamesSignInResult>;
  signOut(): Promise<{ success: boolean }>;
}

const PlayGames = registerPlugin<PlayGamesPlugin>('PlayGames');

export default PlayGames;
