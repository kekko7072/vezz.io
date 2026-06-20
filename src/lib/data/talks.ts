export type Talk = {
	date: string;
	topic: string;
	location: string;
	organization: string;
	url?: string;
};

export const talks: Talk[] = [
	{
		date: 'Feb 13, 2026',
		topic: 'On-device AI: the hidden OS APIs and how we can use them',
		location: 'Sanmarco Informatica S.p.A., Provincia di Vicenza, Italy',
		organization: 'GDG Vicenza',
		url: 'https://gdg.community.dev/events/details/google-gdg-vicenza-presents-on-device-ai-the-hidden-os-apis-and-how-we-can-use-them/'
	},
	{
		date: 'May 23, 2025',
		topic: 'AI and New Device Formats - A hands-on guide to the future of AI',
		location: 'Rovolon (Padua), Italy',
		organization: 'Comune di Rovolon'
	},
	{
		date: 'May 19, 2025',
		topic: 'AI for the Engineering Community',
		location: 'Padua, Italy',
		organization: 'Ordine degli Ingegneri di Padova'
	},
	{
		date: 'Mar 27, 2024',
		topic: 'Running Flutter on Raspberry Pi and embedded Linux',
		location: 'Padua, Italy',
		organization: 'GDG Padova',
		url: 'https://www.meetup.com/flutter-padova/events/299869679/'
	},
	{
		date: 'Dec 2, 2023',
		topic: 'Building next-generation apps for XR and VR',
		location: 'Venice, Italy',
		organization: 'DevFest Venezia',
		url: 'https://www.youtube.com/watch?v=NaH4XAqWURI'
	}
];
