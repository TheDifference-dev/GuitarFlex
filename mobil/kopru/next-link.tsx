// next/link yerine (DOM bileşenlerinde): tıklama, yerel uygulamanın yönlendiricisine iletilir (kopru/git.ts)
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { git } from "./git";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string | { pathname: string }; children?: ReactNode; prefetch?: boolean; replace?: boolean; scroll?: boolean };

export default function Link({ href, children, onClick, prefetch: _p, replace: _r, scroll: _s, ...geri }: Props) {
  const yol = typeof href === "string" ? href : href.pathname;
  return (
    <a
      href={yol}
      {...geri}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
        git(yol);
      }}
    >
      {children}
    </a>
  );
}
