import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { Brain } from 'lucide-react';

interface Footer7Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: any;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Leaderboard', href: '#leaderboard' },
      { name: 'Demo', href: '#' },
      { name: 'API', href: '#' },
    ],
  },
  {
    title: 'Support',
    links: [
      { name: 'Help Center', href: '#' },
      { name: 'Contact Us', href: '#' },
      { name: 'Parent Guide', href: '#' },
      { name: 'Teacher Resources', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'COPPA Compliance', href: '#' },
      { name: 'GDPR-K', href: '#' },
    ],
  },
];

const defaultSocialLinks = [
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
];

const defaultLegalLinks = [
  { name: 'Terms and Conditions', href: '#' },
  { name: 'Privacy Policy', href: '#' },
];

export const Footer7 = ({
  logo = {
    url: '/',
    src: '',
    alt: 'BrainBuddy Logo',
    title: 'BrainBuddy',
  },
  sections = defaultSections,
  description = 'Making learning feel like play for every student. AI-powered education that transforms boring study sessions into exciting adventures.',
  socialLinks = defaultSocialLinks,
  copyright = '© 2024 BrainBuddy. All rights reserved. Made with ❤️ for young learners.',
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className='pt-16 pb-0 bg-background border-t border-border'>
      <div className='container mx-auto px-4'>
        <div className='flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left'>
          <div className='flex w-full flex-col justify-between gap-6 lg:items-start'>
            {/* Logo */}
            <div className='flex items-center gap-2 lg:justify-start'>
              <a href={logo.url} className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center'>
                  <Brain className='w-5 h-5 text-white' />
                </div>
                <h2 className='text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                  {logo.title}
                </h2>
              </a>
            </div>
            <p className='max-w-[70%] text-sm text-muted-foreground'>
              {description}
            </p>
            <ul className='flex items-center space-x-6 text-muted-foreground'>
              {socialLinks.map((social, idx) => {
                const IconComponent = social.icon;
                return (
                  <li key={idx} className='font-medium hover:text-primary transition-colors'>
                    <a href={social.href} aria-label={social.label}>
                      <IconComponent className='size-5' />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className='grid w-full gap-6 md:grid-cols-3 lg:gap-20'>
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className='mb-4 font-bold text-foreground'>{section.title}</h3>
                <ul className='space-y-3 text-sm text-muted-foreground'>
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className='font-medium hover:text-primary transition-colors'
                    >
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className='mt-8 flex flex-col justify-between gap-4 border-t border-border py-8 text-xs font-medium text-muted-foreground md:flex-row md:items-center md:text-left'>
          <p className='order-2 lg:order-1'>{copyright}</p>
          <ul className='order-1 flex flex-col gap-2 md:order-2 md:flex-row'>
            {legalLinks.map((link, idx) => (
              <li key={idx} className='hover:text-primary transition-colors'>
                <a href={link.href}> {link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
