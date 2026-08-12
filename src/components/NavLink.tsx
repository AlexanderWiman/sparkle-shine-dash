import { forwardRef } from "react";
import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
  children: React.ReactNode;
  end?: boolean;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(({
  to,
  activeClassName = "bg-sidebar-accent text-sidebar-accent-foreground",
  className,
  children,
  end = false,
  ...props
}, ref) => {
  const location = useLocation();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to.toString());

  return (
    <Link
      ref={ref}
      to={to}
      className={cn(className, isActive && activeClassName)}
      {...props}
    >
      {children}
    </Link>
  );
});

NavLink.displayName = "NavLink";
