import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Bell, LogOut, Menu, Search, Triangle, Users, X } from "lucide-react";
import { AvatarImage } from "../../../components/AvatarImage";
import { getMainSiteBaseUrl } from "../../../services/platformEnvironment";

export interface PlatformPlayerState {
  session: {
    status: "anonymous" | "authenticated";
    user: { displayName: string; avatarUrl: string | null } | null;
  };
  notifications: { unreadCount: number };
}

export interface PlatformPlayerHeaderProps {
  gameName: string;
  state: PlatformPlayerState;
  onSignIn: () => void;
  signInPending?: boolean;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  onOpenNotifications: () => void;
  onToggleMute: () => void;
  sidebarContent?: ReactNode;
}

export function PlatformPlayerHeader({ state, onSignIn, signInPending = false, sidebarOpen, onSidebarOpenChange, onSignOut, onOpenNotifications, sidebarContent }: PlatformPlayerHeaderProps): ReactElement {
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const accountRef = useRef<HTMLDetailsElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const sidebarToggleRef = useRef<HTMLButtonElement>(null);
  const searchLabelRef = useRef<HTMLLabelElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const sidebarId = useId();
  const searchId = useId();
  const authenticated = state.session.status === "authenticated";
  const userLabel = state.session.user?.displayName || "Player";
  const avatarUrl = state.session.user?.avatarUrl;
  const notificationLabel = state.notifications.unreadCount > 0 ? `${state.notifications.unreadCount} unread notifications` : "Notifications";
  const mainSiteUrl = getMainSiteBaseUrl();
  const searchResponsiveClass = mobileSearchOpen
    ? "max-[640px]:absolute max-[640px]:left-3 max-[640px]:right-3 max-[640px]:top-full max-[640px]:z-10 max-[640px]:mt-2 max-[640px]:h-12 max-[640px]:w-auto max-[640px]:max-w-none max-[640px]:shadow-[var(--shadow-dropdown)]"
    : "max-[640px]:hidden";

  useEffect(() => {
    if (mobileSearchOpen) searchInputRef.current?.focus();
  }, [mobileSearchOpen]);
  useEffect(() => {
    const dismissAccount = (event: PointerEvent) => {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) accountRef.current?.removeAttribute("open");
    };
    const dismissSearch = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (searchLabelRef.current?.contains(event.target) || searchToggleRef.current?.contains(event.target)) return;
      setMobileSearchOpen(false);
    };
    const dismissPanels = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (mobileSearchOpen) {
        setMobileSearchOpen(false);
        searchToggleRef.current?.focus();
      }
      if (accountRef.current?.open) {
        accountRef.current.removeAttribute("open");
        accountRef.current.querySelector("summary")?.focus();
      }
      onSidebarOpenChange(false);
    };
    document.addEventListener("pointerdown", dismissAccount);
    document.addEventListener("keydown", dismissPanels);
    if (mobileSearchOpen) document.addEventListener("pointerdown", dismissSearch);
    return () => {
      document.removeEventListener("pointerdown", dismissAccount);
      document.removeEventListener("keydown", dismissPanels);
      document.removeEventListener("pointerdown", dismissSearch);
    };
  }, [mobileSearchOpen, onSidebarOpenChange]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const dismissSidebar = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      if (sidebarRef.current?.contains(event.target) || sidebarToggleRef.current?.contains(event.target)) return;
      onSidebarOpenChange(false);
    };
    document.addEventListener("pointerdown", dismissSidebar);
    return () => document.removeEventListener("pointerdown", dismissSidebar);
  }, [onSidebarOpenChange, sidebarOpen]);

  return (
    <>
      <header className="relative z-[40] flex w-full flex-none bg-black text-white shadow-[0_1px_0_var(--color-neutral-800)] [--button-outline-text:var(--color-neutral-200)] [--button-outline-bg:transparent] [--button-outline-bg-hover:var(--color-neutral-800)] [--button-outline-bg-active:var(--color-neutral-700)] [--button-outline-border:var(--color-neutral-700)] [--button-solid-bg:var(--color-white)] [--button-solid-text:var(--color-black)] [--button-solid-bg-hover:var(--color-neutral-200)] [--button-solid-bg-active:var(--color-neutral-300)] [--button-solid-bg-disabled:var(--color-neutral-800)] [--button-solid-text-disabled:var(--color-neutral-400)]">
        <div className="mx-auto grid h-[60px] w-full grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-4 px-6 max-[720px]:flex max-[720px]:gap-2 max-[720px]:px-3 max-[480px]:gap-1 max-[480px]:py-2">
          <div className="flex min-w-0 items-center gap-0 justify-self-start">
            <button
              ref={sidebarToggleRef}
              className="btn btn--outline btn--icon-only btn--lg group relative flex h-10 w-10 flex-none items-center justify-center border-transparent p-0 max-[480px]:!w-9"
              type="button"
              aria-label={sidebarOpen ? "Collapse game categories" : "Expand game categories"}
              title={sidebarOpen ? "Collapse game categories" : "Expand game categories"}
              aria-expanded={sidebarOpen}
              aria-controls={sidebarId}
              onClick={() => onSidebarOpenChange(!sidebarOpen)}
            >
              <span className="relative block h-7 w-7" aria-hidden="true">
                <Menu size={28} />
                <Triangle
                  className={`absolute right-0 top-2 rotate-90 bg-black fill-current transition-transform duration-200 group-hover:bg-neutral-800 group-active:bg-neutral-700 ${sidebarOpen ? "-rotate-90" : ""}`}
                  size={12}
                />
              </span>
            </button>
            <a
              className="flex h-11 w-[152px] shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] max-[720px]:w-[100px] max-[480px]:w-[80px]"
              href={mainSiteUrl}
              aria-label="Randseed game home"
            >
              <img className="block h-full w-full object-contain object-left" src="https://storage.randseed.org/Logo/Logo.png" alt="Randseed" />
            </a>
          </div>
          <label
            ref={searchLabelRef}
            id={searchId}
            className={`flex h-10 w-full max-w-[520px] min-w-0 items-center justify-self-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-300 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--focus-ring)] ${searchResponsiveClass}`}
          >
            <Search className="shrink-0" size={18} aria-hidden="true" />
            <input
              ref={searchInputRef}
              className="w-full min-w-0 appearance-none border-0 bg-transparent p-0 font-sans text-sm text-white outline-none placeholder:text-neutral-500 max-[640px]:text-base"
              type="search"
              aria-label="Search games"
              placeholder="Search"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>
          <div className="flex flex-none items-center justify-self-end gap-3 max-[720px]:ml-auto max-[720px]:gap-1">
            <button
              ref={searchToggleRef}
              className="btn btn--outline btn--icon-only btn--lg relative hidden h-10 w-10 flex-none items-center justify-center border-transparent p-0 max-[480px]:!w-9 max-[640px]:grid"
              type="button"
              aria-label={mobileSearchOpen ? "Close game search" : "Open game search"}
              title={mobileSearchOpen ? "Close search" : "Search games"}
              aria-expanded={mobileSearchOpen}
              aria-controls={searchId}
              onClick={() => setMobileSearchOpen(value => !value)}
            >
              {mobileSearchOpen
                ? <X className="btn__icon h-[22px] w-[22px] fill-none" size={22} aria-hidden="true" />
                : <Search className="btn__icon h-[22px] w-[22px] fill-none" size={22} aria-hidden="true" />}
            </button>
            <a
              className="btn btn--outline btn--icon-only btn--lg relative flex h-10 w-10 flex-none items-center justify-center border-transparent p-0 max-[480px]:!w-9"
              href={`${mainSiteUrl}/friends`}
              aria-label="Friends"
              title="Friends"
            >
              <Users className="btn__icon h-[22px] w-[22px] fill-none" size={22} aria-hidden="true" />
            </a>
            <button
              className="btn btn--outline btn--icon-only btn--lg relative flex h-10 w-10 flex-none items-center justify-center border-transparent p-0 max-[480px]:!w-9"
              type="button"
              aria-label={notificationLabel}
              title={notificationLabel}
              onClick={onOpenNotifications}
            >
              <Bell className="btn__icon h-[22px] w-[22px] fill-none" size={22} aria-hidden="true" />
              {state.notifications.unreadCount > 0 && (
                <span className="absolute right-0 top-0 rounded-full bg-red-600 px-1 text-xs leading-[1.4] text-white" aria-hidden="true">
                  {state.notifications.unreadCount > 99 ? "99+" : state.notifications.unreadCount}
                </span>
              )}
            </button>
            {authenticated ? (
              <details ref={accountRef} className="relative">
                <summary
                  className="grid h-10 w-10 cursor-pointer list-none place-items-center overflow-hidden rounded-full border border-neutral-700 bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] [&::-webkit-details-marker]:hidden"
                  aria-label={`Account: ${userLabel}`}
                  title={`Account: ${userLabel}`}
                >
                  <AvatarImage
                    src={avatarUrl}
                    alt=""
                    imageClassName="h-full w-full object-cover"
                    fallbackClassName="grid h-full w-full place-items-center text-neutral-400"
                    iconClassName="h-[22px] w-[22px]"
                  />
                </summary>
                <div className="absolute right-0 top-[calc(100%+0.5rem)] grid w-[220px] gap-3 rounded-md border border-neutral-700 bg-neutral-900 p-4 shadow-[var(--shadow-dropdown)]">
                  <span className="text-sm [overflow-wrap:anywhere]">{userLabel}</span>
                  <button className="btn btn--outline btn--sm" type="button" onClick={() => { accountRef.current?.removeAttribute("open"); onSignOut?.(); }}><LogOut className="btn__icon" size={16} aria-hidden="true" />Sign Out</button>
                </div>
              </details>
            ) : (
              <button
                className={`btn btn--solid btn--sm h-10 min-h-10 whitespace-nowrap max-[480px]:px-3${signInPending ? " btn--loading" : ""}`}
                type="button"
                disabled={signInPending}
                aria-busy={signInPending}
                onClick={onSignIn}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      <aside
        ref={sidebarRef}
        id={sidebarId}
        className="game-shell-sidebar fixed bottom-0 left-[var(--player-sidebar-edge)] top-[60px] z-[30] w-[var(--player-sidebar-width)] border-r border-neutral-800 bg-black"
        aria-label="Player navigation"
        hidden={!sidebarOpen}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
