import { IS_BETA } from './release';

export const APP_NAME = 'Resigna';
/** Product name as shown to people: "Resigna Beta" on BA, "Resigna" on GA. */
export const APP_DISPLAY_NAME = IS_BETA ? `${APP_NAME} Beta` : APP_NAME;
export const APP_TAGLINE = 'Transform research into evidence-backed design.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const LANDING_URL = process.env.NEXT_PUBLIC_LANDING_URL || APP_URL;

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 56;

export const MAX_PROJECT_NAME_LENGTH = 100;
export const MAX_WORKSPACE_NAME_LENGTH = 60;
