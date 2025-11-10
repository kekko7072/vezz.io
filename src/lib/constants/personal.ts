// Personal information constants

export const PERSONAL_INFO = {
  name: {
    first: "Francesco",
    last: "Vezzani",
    full: "Francesco Vezzani",
  },
  title: "Founder & CTO • Robotics Engineer",
  siteName: "vezz.io",
  siteTagline: "Input Output from Vezz",
  email: "francesco.vezz01@gmail.com",
  profileImage: {
    src: "https://avatars.githubusercontent.com/u/32552589?v=4",
    alt: "Profile photo placeholder",
  },
  socialLinks: [
    { name: "GitHub", url: "https://github.com/kekko7072" },
    { name: "LinkedIn", url: "https://linkedin.com/in/kekko7072" },
  ],
  bio: [
    "Hey! I'm Francesco, a Robotics Engineering student who loves turning ideas into reality. When I'm not buried in code or tinkering with hardware, you'll find me building cool stuff with IoT, mobile apps, and the occasional 3D printer project.",
    "I'm that person who gets excited about solving problems and making things work. Whether it's a Flutter app, a Node.js backend, or a custom circuit board, I'm always up for the challenge. Life's too short to not build awesome things!",
  ],
} as const;
