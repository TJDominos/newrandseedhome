import { useEffect, useRef, type ReactElement } from "react";
import { Bell, LogOut, Menu, Triangle, Users } from "lucide-react";
import { AvatarImage } from "./AvatarImage";
import { getMainSiteBaseUrl } from "../services/platformEnvironment";

export interface PlatformPlayerState {
  session: {
    status: "anonymous" | "authenticated";
    user: { displayName: string; avatarUrl: string | null } | null;
  };
  notifications: { unreadCount: number };
}

export interface AppHeaderProps {
  agentOpen: boolean;
  onToggleAgent: () => void;
  state: PlatformPlayerState;
  onSignIn: () => void;
  signInPending?: boolean;
  onSignOut: () => void;
  onOpenNotifications: () => void;
}

export function AppHeader({
  agentOpen,
  onToggleAgent,
  state,
  onSignIn,
  signInPending = false,
  onSignOut,
  onOpenNotifications,
}: AppHeaderProps): ReactElement {
  const accountRef = useRef<HTMLDetailsElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const authenticated = state.session.status === "authenticated";
  const userLabel = state.session.user?.displayName || "Player";
  const avatarUrl = state.session.user?.avatarUrl;
  const notificationLabel =
    state.notifications.unreadCount > 0
      ? `${state.notifications.unreadCount} unread notifications`
      : "Notifications";
  const mainSiteUrl = getMainSiteBaseUrl();

  useEffect(() => {
    const dismissAccount = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !accountRef.current?.contains(event.target)
      ) {
        accountRef.current?.removeAttribute("open");
      }
    };

    const dismissPanels = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (accountRef.current?.open) {
        accountRef.current.removeAttribute("open");
        accountRef.current.querySelector("summary")?.focus();
      }
    };

    document.addEventListener("pointerdown", dismissAccount);
    document.addEventListener("keydown", dismissPanels);
    return () => {
      document.removeEventListener("pointerdown", dismissAccount);
      document.removeEventListener("keydown", dismissPanels);
    };
  }, []);

  return (
    <header className="relative z-[40] flex w-full flex-none bg-black text-white shadow-[0_1px_0_var(--color-neutral-800)] [--button-outline-text:var(--color-neutral-200)] [--button-outline-bg:transparent] [--button-outline-bg-hover:var(--color-neutral-800)] [--button-outline-bg-active:var(--color-neutral-700)] [--button-outline-border:var(--color-neutral-700)] [--button-solid-bg:var(--color-white)] [--button-solid-text:var(--color-black)] [--button-solid-bg-hover:var(--color-neutral-200)] [--button-solid-bg-active:var(--color-neutral-300)] [--button-solid-bg-disabled:var(--color-neutral-800)] [--button-solid-text-disabled:var(--color-neutral-400)]">
      <div className="mx-auto flex h-[60px] w-full items-center justify-between px-4">
        
        {/* Left Side: Sidebar Toggle (controls Agent panel) + Brand Logo */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            ref={toggleButtonRef}
            className="btn btn--outline btn--icon-only btn--lg group relative flex h-10 w-10 flex-none items-center justify-start border-transparent p-0 max-[480px]:!w-9 cursor-pointer"
            type="button"
            aria-label={agentOpen ? "Collapse Agent sidebar" : "Expand Agent sidebar"}
            title={agentOpen ? "Collapse Agent sidebar" : "Expand Agent sidebar"}
            aria-expanded={agentOpen}
            onClick={onToggleAgent}
          >
            <span className="relative block h-7 w-7" aria-hidden="true">
              <Menu size={28} />
              <Triangle
                className={`absolute right-0 top-2 rotate-90 bg-black fill-current transition-transform duration-200 group-hover:bg-neutral-800 group-active:bg-neutral-700 ${
                  agentOpen ? "-rotate-90" : ""
                }`}
                size={12}
              />
            </span>
          </button>

          <a
            className="flex h-11 w-[130px] sm:w-[152px] shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] max-[480px]:w-[95px]"
            href={mainSiteUrl}
            aria-label="Randseed Game Home"
          >
            <img
              className="block h-full w-full object-contain object-left"
              src="https://storage.randseed.org/Logo/Logo.png"
              alt="Randseed"
            />
          </a>
        </div>

        {/* Right Side: Friends link, Notifications, and Account Profile */}
        <div className="flex flex-none items-center gap-2 sm:gap-3">
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
              <span
                className="absolute right-0 top-0 rounded-full bg-red-600 px-1 text-xs leading-[1.4] text-white"
                aria-hidden="true"
              >
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
              <div className="absolute right-0 top-[calc(100%+0.5rem)] grid w-[220px] gap-3 rounded-md border border-neutral-700 bg-neutral-900 p-4 shadow-[var(--shadow-dropdown)] z-50">
                <span className="text-sm font-semibold [overflow-wrap:anywhere] text-white">
                  {userLabel}
                </span>
                <button
                  className="btn btn--outline btn--sm flex items-center justify-center gap-2 text-xs"
                  type="button"
                  onClick={() => {
                    accountRef.current?.removeAttribute("open");
                    onSignOut?.();
                  }}
                >
                  <LogOut className="btn__icon" size={16} aria-hidden="true" />
                  Sign Out
                </button>
              </div>
            </details>
          ) : (
            <button
              className={`btn btn--solid btn--sm h-10 min-h-10 whitespace-nowrap px-4 font-bold max-[480px]:px-3${
                signInPending ? " btn--loading" : ""
              }`}
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
  );
}
