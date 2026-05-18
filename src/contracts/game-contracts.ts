export enum MissionType { COMBAT = "combat", EXPLORATION = "exploration", PUZZLE = "puzzle" }
export interface AdaptiveMission { id: string; type: MissionType; difficulty: number; baseReward: number; }
export interface RewardEnvelope { minReward: number; maxReward: number; decayRate: number; }
export interface PlayerModel { id: string; level: number; experience: number; }
export class MissionRegistry {
  private missions: Map<string, AdaptiveMission> = new Map();
  register(m: AdaptiveMission) { this.missions.set(m.id, m); }
  getAvailable(level: number): AdaptiveMission[] { return Array.from(this.missions.values()).filter(m => m.difficulty <= level); }
}
