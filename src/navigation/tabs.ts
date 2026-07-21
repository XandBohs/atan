import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

export type AppTab = 'inicio' | 'fichas' | 'historico' | 'perfil';
type IconName = ComponentProps<typeof Ionicons>['name'];

export type AppTabItem = {
  id: AppTab;
  label: string;
  icon: IconName;
  activeIcon: IconName;
};

export const appTabs: AppTabItem[] = [
  { id: 'inicio', label: 'Início', icon: 'home-outline', activeIcon: 'home' },
  { id: 'fichas', label: 'Fichas', icon: 'clipboard-outline', activeIcon: 'clipboard' },
  { id: 'historico', label: 'Histórico', icon: 'time-outline', activeIcon: 'time' },
  { id: 'perfil', label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
];

