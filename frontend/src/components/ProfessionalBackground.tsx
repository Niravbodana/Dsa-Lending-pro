/** Subtle animated mesh + orbs — matches NeerCred teal/sky fintech theme */
export function ProfessionalBackground() {
  return (
    <div className="site-ambient-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="site-ambient-mesh" />
      <div className="site-ambient-orb site-ambient-orb--1" />
      <div className="site-ambient-orb site-ambient-orb--2" />
      <div className="site-ambient-orb site-ambient-orb--3" />
      <div className="site-ambient-shimmer" />
    </div>
  );
}
