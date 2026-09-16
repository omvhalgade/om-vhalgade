import React from 'react';
import { KineticText } from './KineticText';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <div style={{ fontSize: '24px', marginBottom: '8px', fontWeight: 500 }}>
            <KineticText as="span">Om Vhalgade</KineticText>
          </div>
          <p style={{ margin: 0, opacity: 0.7, maxWidth: '38ch', fontSize: '15px', lineHeight: 1.5 }}>
            Creative Developer &bull; Building modern, interactive web experiences.
          </p>
        </div>
        <div className="footer-links">
          <a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>
            <KineticText as="span">About</KineticText>
          </a>
          <a href="#work" onClick={(e) => handleLinkClick(e, 'work')}>
            <KineticText as="span">Work</KineticText>
          </a>
          <a href="#skills" onClick={(e) => handleLinkClick(e, 'skills')}>
            <KineticText as="span">Skills</KineticText>
          </a>
          <a href="#experience" onClick={(e) => handleLinkClick(e, 'experience')}>
            <KineticText as="span">Experience</KineticText>
          </a>
          <a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')}>
            <KineticText as="span">Contact</KineticText>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">&copy; 2026 Om Vhalgade. All rights reserved.</p>
        <a
          href="#hero"
          className="footer-return-top"
          onClick={(e) => handleLinkClick(e, 'hero')}
        >
          <span>Return to Top</span>
          <span aria-hidden="true">&uarr;</span>
        </a>
      </div>
    </footer>
  );
};
