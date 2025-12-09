import { League, Team, Position } from '@/types/team';

/**
 * Available screens in the modal
 */
export type ModalScreen =
  | 'main'
  | 'league-select'
  | 'league-create'
  | 'team-select'
  | 'team-create'
  | 'position-select'
  | 'position-create';

/**
 * Main form data for creating a user team
 */
export interface UserTeamFormData {
  sport: string;
  country: string;
  league: League | null;
  team: Team | null;
  yearJoined: number | '';
  yearLeft: number | '';
  isCurrentTeam: boolean;
  position: Position | null;
  jerseyNumber: number | '';
}

/**
 * League creation form data
 */
export interface LeagueFormData {
  name: string;
  abbreviation: string;
  state: string;
  // sport and country inherited from main form
}

/**
 * Team creation form data
 */
export interface TeamFormData {
  name: string;
  level: string;
  logoFile: File | null;
  // league and sport inherited from main form
}

/**
 * Position creation form data
 */
export interface PositionFormData {
  name: string;
  abbreviation: string;
  // sport inherited from main form
}

/**
 * Complete modal state
 */
export interface AddUserTeamModalState {
  currentScreen: ModalScreen;
  screenHistory: ModalScreen[];
  formData: UserTeamFormData;
  leagueFormData: LeagueFormData;
  teamFormData: TeamFormData;
  positionFormData: PositionFormData;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

/**
 * Initial form data values
 */
export const initialFormData: UserTeamFormData = {
  sport: '',
  country: '',
  league: null,
  team: null,
  yearJoined: '',
  yearLeft: '',
  isCurrentTeam: false,
  position: null,
  jerseyNumber: '',
};

export const initialLeagueFormData: LeagueFormData = {
  name: '',
  abbreviation: '',
  state: '',
};

export const initialTeamFormData: TeamFormData = {
  name: '',
  level: '',
  logoFile: null,
};

export const initialPositionFormData: PositionFormData = {
  name: '',
  abbreviation: '',
};
