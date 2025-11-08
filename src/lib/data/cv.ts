// CV data - experience, education, and skills

import type { Experience, Education, SkillGroup } from '$lib/types/cv';

export const experiences: Experience[] = [
	{
		company: 'Amperry (startup)',
		role: 'Internship Development Team',
		period: '2021 - Present',
		description: 'Building cool IoT stuff and mobile apps! I get to work with Flutter, Node.js, and Google Cloud - basically my playground for turning ideas into reality.',
		technologies: ['Flutter SDK', 'Node.js', 'Google Cloud', 'IoT', 'Mobile Development'],
		achievements: [
			'Built the mobile app frontend and part of the IoT backend (yes, I do both!)',
			'Made different systems talk to each other (integration wizard, that\'s me)',
			'Helped plan and upgrade the entire software infrastructure (because someone had to do it)'
		]
	},
	{
		company: 'MINDIT (startup)',
		role: 'Internship Development Team',
		period: '2020 - 2021',
		description: 'My first real startup experience! Learned a ton about building products from scratch and making technical decisions that actually matter.',
		technologies: ['Flutter SDK', 'Node.js', 'Mobile App', 'Web Development'],
		achievements: [
			'Built both backend and frontend (mobile + web - full stack, baby!)',
			'Led a small team and gave feedback (turns out I\'m pretty good at this)',
			'Fixed issues faster than you can say "it works on my machine"'
		]
	}
];

export const education: Education[] = [
	{
		institution: 'University of Padua (ITALY)',
		degree: 'Mechatronic Engineering',
		period: '2020 - Present',
		description: 'Currently studying Mechatronic Engineering - where robots, code, and hardware meet. It\'s as cool as it sounds!'
	},
	{
		institution: 'Classical High School, Venice, Italy',
		degree: 'Classical High School Diploma',
		period: '2015 - 2020',
		description: 'Graduated from classical high school in beautiful Venice. Yes, I can read Latin, but I prefer reading code now.'
	}
];

export const skills: SkillGroup[] = [
	{ category: 'Coding', items: ['Dart', 'TypeScript', 'C/C++', 'SQL', 'Python', 'Docker', 'HTML', 'JavaScript', 'bash'] },
	{ category: 'Framework/SDK/Tools', items: ['Flutter SDK', 'Node.js', 'Google Cloud', 'MQTT', 'LabVIEW', 'TensorFlow', 'pandas', 'Linux', 'SwiftUI'] },
	{ category: 'Manufacturing', items: ['CAD Software', 'Circuit design (PCB)', '3D Printing (FFF)', 'Laser cutting', 'Electrode welding', 'CNC milling'] },
	{ category: 'Languages', items: ['Italian (native)', 'English (B2)', 'German (A1)'] }
];
