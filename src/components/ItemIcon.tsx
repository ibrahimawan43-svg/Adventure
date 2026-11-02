import React from 'react';
import {
  Sword,
  Shield,
  FlaskConical,
  Scroll,
  Key,
  Gem,
  Compass,
  BookOpen,
  Sparkles,
  Crosshair,
  Package,
  Wand2,
  Skull,
} from 'lucide-react';

interface ItemIconProps {
  icon?: string;
  type?: string;
  className?: string;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ icon = '', type = '', className = 'w-4 h-4' }) => {
  const norm = (icon + ' ' + type).toLowerCase();

  if (norm.includes('sword') || norm.includes('blade') || norm.includes('dagger') || norm.includes('axe') || norm.includes('spear')) {
    return <Sword className={className} />;
  }
  if (norm.includes('shield') || norm.includes('armor') || norm.includes('helm') || norm.includes('plate')) {
    return <Shield className={className} />;
  }
  if (norm.includes('potion') || norm.includes('elixir') || norm.includes('vial') || norm.includes('consumable')) {
    return <FlaskConical className={className} />;
  }
  if (norm.includes('scroll') || norm.includes('parchment') || norm.includes('map') || norm.includes('document')) {
    return <Scroll className={className} />;
  }
  if (norm.includes('key') || norm.includes('lock') || norm.includes('access')) {
    return <Key className={className} />;
  }
  if (norm.includes('gem') || norm.includes('relic') || norm.includes('crystal') || norm.includes('orb')) {
    return <Gem className={className} />;
  }
  if (norm.includes('compass') || norm.includes('beacon') || norm.includes('guide')) {
    return <Compass className={className} />;
  }
  if (norm.includes('book') || norm.includes('tome') || norm.includes('grimoire') || norm.includes('journal')) {
    return <BookOpen className={className} />;
  }
  if (norm.includes('wand') || norm.includes('staff') || norm.includes('rod')) {
    return <Wand2 className={className} />;
  }
  if (norm.includes('skull') || norm.includes('bone') || norm.includes('curse')) {
    return <Skull className={className} />;
  }
  if (norm.includes('gun') || norm.includes('rifle') || norm.includes('blaster')) {
    return <Crosshair className={className} />;
  }
  if (norm.includes('artifact') || norm.includes('magic')) {
    return <Sparkles className={className} />;
  }

  return <Package className={className} />;
};
