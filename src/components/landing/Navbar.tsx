import React, { useEffect, useMemo, useState } from "react";
import { IconArrow, IconHamburger } from "./Icons";

type SessionShape = {
  isAdmin?: boolean;
} | null;

const NAV_ITEMS = [
  { id: "hero", label: "Acasa" },
  { id: "features", label: "Functionalitati" },
  { id: "tasks", label: "Taskuri" },
  { id: "calendar", label: "Calendar" },
  { id: "invites", label: "Invitatii" },
  { id: "budget", label: "Buget" },
  { id: "links", label: "Linkuri" },
  { id: "preview", label: "Preview" },
  { id: "tutorial", label: "Tutoriale" },
  { id: "partners", label: "Parteneri" },
  { id: "stats", label: "Statistici" },
  { id: "smart", label: "AI" },
  { id: "process", label: "Proces" },
  { id: "pricing", label: "Preturi" },
  { id: "testimonials", label: "Review-uri" },
  { id: "faq", label: "Intrebari" },
  { id: "about", label: "Despre" },
];

const DESKTOP_NAV_GROUPS = [
  {
    label: "Platforma",
    items: [
      { id: "hero", label: "Acasa" },
      { id: "features", label: "Functionalitati" },
      { id: "pricing", label: "Preturi" },
      { id: "stats", label: "Statistici" },
      { id: "about", label: "Despre" },
    ],
  },
  {
    label: "Flux",
    items: [
      { id: "tasks", label: "Taskuri" },
      { id: "calendar", label: "Calendar" },
      { id: "invites", label: "Invitatii" },
      { id: "budget", label: "Buget" },
      { id: "links", label: "Linkuri" },
      { id: "preview", label: "Preview" },
    ],
  },
  {
    label: "Resurse",
    items: [
      { id: "tutorial", label: "Tutoriale" },
      { id: "partners", label: "Parteneri" },
      { id: "smart", label: "AI" },
      { id: "process", label: "Proces" },
      { id: "testimonials", label: "Review-uri" },
      { id: "faq", label: "Intrebari" },
    ],
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<SessionShape>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("weddingPro_session");
    if (!saved) return;
    try {
      setSession(JSON.parse(saved));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest(".wp-nav-groups")) {
        setOpenGroup(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const dashboardHref = useMemo(() => {
    if (!session) return null;
    return session.isAdmin ? "/admin" : "/dashboard";
  }, [session]);

  const close = () => setOpen(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    close();
  };

  return (
    <nav className={`wp-navbar${isScrolled ? " scrolled" : ""}${open ? " open" : ""}`}>
      <div className="wp-container">
        <div className="wp-nav-shell">
          <div className="wp-nav-inner">
            <div className="wp-nav-top">
              <div className="wp-nav-brand">
                <a href="/" className="wp-nav-logo" aria-label="ESA home">
                  <span className="wp-nav-logo-icon">ESA</span>
                  <span className="wp-nav-brand-copy">
                    <strong>Event Smart Assistant</strong>
                    {/* <span>Invitatii digitale premium</span> */}
                  </span>
                </a>
              </div>
              <div className="wp-nav-groups" aria-label="Navigatie principala">
              {DESKTOP_NAV_GROUPS.map((group) => {
                const expanded = openGroup === group.label;
                return (
                  <div
                    key={group.label}
                    className={`wp-nav-group${expanded ? " open" : ""}`}
                    onMouseEnter={() => setOpenGroup(group.label)}
                    onMouseLeave={() => setOpenGroup((current) => (current === group.label ? null : current))}
                  >
                    <button
                      type="button"
                      className="wp-nav-group-trigger"
                      onClick={() => setOpenGroup((current) => (current === group.label ? null : group.label))}
                      aria-expanded={expanded}
                    >
                      <span>{group.label}</span>
                      <span className="wp-nav-group-caret">+</span>
                    </button>

                    <div className="wp-nav-group-menu">
                      {group.items.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          onClick={(event) => {
                            event.preventDefault();
                            setOpenGroup(null);
                            scrollTo(item.id);
                          }}
                        >
                          <span>{item.label}</span>
                          <IconArrow />
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
              <div className="wp-nav-actions">
                {session ? (
                  <a href={dashboardHref || "/dashboard"} className="wp-btn-primary wp-btn-nav-main">
                    {session.isAdmin ? "Panou Admin" : "Panou Control"}
                    <IconArrow />
                  </a>
                ) : (
                  <>
                    <a href="/login" className="wp-btn-ghost wp-btn-nav-secondary">
                      Autentificare
                    </a>
                    <a href="/register" className="wp-btn-primary wp-btn-nav-main">
                      Incepe Gratuit
                      <IconArrow />
                    </a>
                  </>
                )}

                <button
                  type="button"
                  className="wp-hamburger"
                  onClick={() => setOpen((value) => !value)}
                  aria-label={open ? "Inchide meniu" : "Deschide meniu"}
                  aria-expanded={open}
                >
                  <IconHamburger />
                </button>
              </div>
            </div>

            
          </div>

          {open && (
            <div className="wp-mobile-menu">
              <div className="wp-mobile-menu-panel">
                <div className="wp-mobile-menu-head">
                  <span className="wp-mobile-menu-label">Navigatie rapida</span>
                </div>

                <div className="wp-mobile-menu-links">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        scrollTo(item.id);
                      }}
                    >
                      <span>{item.label}</span>
                      <IconArrow />
                    </a>
                  ))}
                </div>

                <div className="wp-mobile-menu-actions">
                  {session ? (
                    <a href={dashboardHref || "/dashboard"} className="wp-btn-primary wp-mobile-cta" onClick={close}>
                      {session.isAdmin ? "Panou Admin" : "Panou Control"}
                      <IconArrow />
                    </a>
                  ) : (
                    <>
                      <a href="/login" className="wp-btn-ghost wp-mobile-ghost" onClick={close}>
                        Autentificare
                      </a>
                      <a href="/register" className="wp-btn-primary wp-mobile-cta" onClick={close}>
                        Creeaza cont gratuit
                        <IconArrow />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
