declare module 'react-router-dom' {
  import React from 'react';

  export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    to?: string;
    href?: string;
    replace?: boolean;
    children?: React.ReactNode;
  }

  export function Link(props: LinkProps): React.JSX.Element;

  export interface NavLinkProps extends Omit<LinkProps, 'className'> {
    className?: string | ((props: { isActive: boolean }) => string);
    end?: boolean;
  }

  export function NavLink(props: NavLinkProps): React.JSX.Element;

  export function useNavigate(): (to: string | number, options?: { replace?: boolean }) => void;

  export function useLocation(): { pathname: string; search: string; hash: string };

  export function useParams<T extends Record<string, string | undefined> = Record<string, string>>(): T;

  export function Outlet(): React.JSX.Element | null;
}

