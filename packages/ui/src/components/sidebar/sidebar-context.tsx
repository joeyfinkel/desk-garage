import * as React from 'react';
import { SidebarContextProps } from './sidebar-context-props';

export const SidebarContext = React.createContext<SidebarContextProps | null>(null);
