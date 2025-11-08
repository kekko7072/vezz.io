// CV-related types

export interface Experience {
	company: string;
	role: string;
	period: string;
	description: string;
	technologies: string[];
	achievements?: string[];
}

export interface Education {
	institution: string;
	degree: string;
	period: string;
	description?: string;
}

export interface SkillGroup {
	category: string;
	items: string[];
}

export type TabType = 'experience' | 'education' | 'skills';
