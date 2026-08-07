/**
 * Re-mounts on every navigation, which is what drives the entry animation. The motion is
 * deliberately small and short: a page that slides far enough to notice reads as sluggish.
 */
const NavigationTransition = ({ children }: { children: React.ReactNode }) => (
  <div className="page-enter">{children}</div>
);

export default NavigationTransition;
