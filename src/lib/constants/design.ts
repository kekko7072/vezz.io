// Design constants for consistent styling across the application

export const COLORS = {
	primary: '#0066cc',
	text: '#000000',
	textSecondary: '#86868b',
	background: '#ffffff',
	border: '#d2d2d7',
	borderLight: '#f5f5f7',
	hover: '#f5f5f7'
} as const;

export const BREAKPOINTS = {
	tablet: 968,
	mobile: 768
} as const;

export const SPACING = {
	sectionPadding: '6rem 2rem',
	sectionPaddingMobile: '4rem 1rem',
	containerMaxWidth: '1200px',
	containerMaxWidthNarrow: '980px'
} as const;

export const TYPOGRAPHY = {
	titleSize: '5rem',
	titleSizeMobile: '3rem',
	subtitleSize: '1.25rem',
	subtitleSizeMobile: '1.125rem',
	bodySize: '1.125rem',
	bodySizeMobile: '1rem'
} as const;
