import type { Session } from "@supabase/supabase-js";
import type { SubmitEvent } from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "../../config/supabase";

interface OwnerCheck {
    userId: string;
    allowed: boolean;
    error: string | null;
}

export default function StudioAccess({
    children
}: {
    children: (canEdit: boolean) => ReactNode;
}) {
    const [session, setSession] = useState<Session | null | undefined>(undefined);
    const [studioRequested, setStudioRequested] = useState(false);

    const [ownerCheck, setOwnerCheck] = useState<OwnerCheck | null>(null);
    const [checkAttempt, setCheckAttempt] = useState(0);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const userId = session?.user.id;
    const activeUserId = useRef<string | undefined>(undefined);

    // Listens for sign-in/session changes
    useEffect(() => {
        const { data } = supabase.auth.onAuthStateChange(
            (_event, nextSession) => {
                if (activeUserId.current !== nextSession?.user.id) {
                    activeUserId.current = nextSession?.user.id;
                    setOwnerCheck(null);
                }

                setSession(nextSession);
                setActionError(null);
            }
        );

        return () => data.subscription.unsubscribe();
    }, []);

    // Calls the database helper
    useEffect(() => {
        if (!userId) return;

        const checkedUserId = userId;
        let cancelled = false;

        async function checkOwner() {
            try {
                const { data, error } = await supabase.rpc("is_studio_owner");

                if (error) throw error;

                if (!cancelled) {
                    setOwnerCheck({
                        userId: checkedUserId,
                        allowed: data === true,
                        error: null
                    });
                }
            } catch {
                if (!cancelled) {
                    setOwnerCheck({
                        userId: checkedUserId,
                        allowed: false,
                        error: "Could not verify Studio access. Please try again."
                    });
                }
            }
        }

        void checkOwner();

        return () => {
            cancelled = true;
        };
    }, [userId, checkAttempt]);

    async function handleSignIn(event: SubmitEvent<HTMLFormElement>) {
        event?.preventDefault();
        if (busy) return;

        setBusy(true);
        setActionError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            if (error) throw error;
            setPassword("");
        } catch {
            setActionError("Could not sign in. Check your details and connection.");
        } finally {
            setBusy(false);
        }
    }

    async function handleSignOut() {
        if (busy) return;

        setBusy(true);
        setActionError(null);

        try {
            const { error } = await supabase.auth.signOut({ scope: "local" });

            if (error) throw error;

            setPassword("");
            setStudioRequested(false);
        } catch {
            setActionError("Could not sign out. Please try again.");
        } finally {
            setBusy(false);
        }
    }

    const viewerButton = (
        <button
            type="button"
            className="utility-button"
            disabled={busy}
            onClick={() => {
                setStudioRequested(false);
                setPassword("");
                setActionError(null);
            }}
        >
            Back to viewer
        </button>
    )

    const signOutButton = (
        <button
            type="button"
            className="utility-button"
            disabled={busy}
            onClick={handleSignOut}
        >
            {busy ? "Please wait..." : "Sign out"}
        </button>
    );

    if (session === undefined) {
        return (
            <p className="studio-access-screen" role="status">
                Checking sign-in...
            </p>
        );
    }

    if (!studioRequested) {
        return (
            <div
                className="studio-shell"
                key={session?.user.id ?? "guest"}
            >
                <div className="studio-session-bar">
                    <span>Timeline Viewer</span>

                    <button
                        type="button"
                        className="utility-button"
                        onClick={() => setStudioRequested(true)}
                    >
                        Studio
                    </button>
                </div>

                {children(false)}
            </div>
        )
    }

    if (session === null) {
        return (
            <main className="studio-access-screen">
                <form
                    className="management-form studio-login"
                    onSubmit={handleSignIn}
                >
                    <h1>Timeline Studio</h1>
                    <p>Sign in to manage your timelines.</p>

                    {actionError && (
                        <p className="form-error" role="alert">
                            {actionError}
                        </p>
                    )}

                    <fieldset disabled={busy}>
                        <div className="form-fields">
                            <label className="form-field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    required
                                />
                            </label>

                            <label className="form-field">
                                <span>Password</span>
                                <input
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    required
                                />
                            </label>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="utility-button"
                            >
                                {busy ? "Signing in..." : "Sign in"}
                            </button>

                            {viewerButton}
                        </div>
                    </fieldset>
                </form>
            </main>
        );
    }

    if (ownerCheck?.userId !== session.user.id) {
        return (
            <main className="studio-access-screen">
                <p role="status">Checking Studio access...</p>

                {actionError && (
                    <p className="form-error" role="alert">
                        {actionError}
                    </p>
                )}

                {signOutButton}

                {viewerButton}
            </main>
        );
    }

    if (!ownerCheck.allowed) {
        return (
            <main className="studio-access-screen">
                <p role="alert">
                    {ownerCheck.error ?? "This account does not have Studio access."}
                </p>

                {actionError && (
                    <p className="form-error" role="alert">
                        {actionError}
                    </p>
                )}

                <div className="form-actions">
                    {ownerCheck.error && (
                        <button
                            type="button"
                            className="utility-button"
                            disabled={busy}
                            onClick={() => {
                                setOwnerCheck(null);
                                setCheckAttempt((current) => current + 1);
                            }}
                        >
                            Try again
                        </button>
                    )}

                    {signOutButton}

                    {viewerButton}
                </div>
            </main>
        );
    }

    return (
        <div
            className="studio-shell"
            key={"studio:" + session.user.id}
        >
            <div className="studio-session-bar">
                <span>Studio - {session.user.email}</span>

                <div className="studio-session-actions">
                    {viewerButton}
                    {signOutButton}
                </div>
            </div>

            {actionError && (
                <p className="form-error" role="alert">
                    {actionError}
                </p>
            )}

            {children(true)}
        </div>
    )
}