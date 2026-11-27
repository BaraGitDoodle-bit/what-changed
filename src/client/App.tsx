import { useEffect, useState } from 'react';
import { Hud } from './components/Hud';
import { ResultCard } from './components/ResultCard';
import { ScenePanel } from './components/ScenePanel';
import { useGame } from './useGame';
import { streakLine } from '../shared/share';

function Splash() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-lg font-black tracking-[0.24em] text-[#F4EFE4]">WHAT CHANGED</h1>
      <p className="mt-3 text-xs text-slate-400">Drawing today&apos;s scene…</p>
    </main>
  );
}

function Notice({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-base font-black tracking-[0.18em] text-[#F4EFE4]">{title}</h1>
      <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-slate-400">{body}</p>
      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-lg bg-[#FFC93C] px-4 py-2 text-xs font-black text-[#20312B]"
        >
          {action}
        </button>
      )}
    </main>
  );
}

export function App() {
  const game = useGame();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (game.result) setDismissed(false);
  }, [game.result]);

  if (game.phase === 'loading') return <Splash />;

  if (game.phase === 'login') {
    return (
      <Notice
        title="WHAT CHANGED"
        body="Log in to Reddit to play today's board — your time, streak and rank live on your account."
      />
    );
  }

  if (game.phase === 'error' || !game.init) {
    return (
      <Notice
        title="SCENE NOT READY"
        body="Couldn't load today's scene. It usually fixes itself in a few seconds."
        action="Try again"
        onAction={() => void game.reload()}
      />
    );
  }

  const init = game.init;
  const scene = init.scene;
  const done = Boolean(game.result);
  const showResult = Boolean(game.result) && !dismissed;
  const streakRecord = {
    streak: init.streak.streak,
    lastPlayed: init.streak.lastPlayed,
    bestMs: init.streak.bestMs ?? 0,
    plays: init.streak.plays,
    snoozes: init.streak.snoozes,
  };

  const panels = (
    <div className="flex flex-col gap-3">
      <ScenePanel
        scene={scene}
        panel="before"
        label="BEFORE"
        rings={game.rings}
        pingZone={game.zone}
        disabled={done}
        shakeKey={game.shake}
        onTap={game.tap}
      />
      <ScenePanel
        scene={scene}
        panel="after"
        label="AFTER"
        rings={game.rings}
        pingZone={game.zone}
        disabled={done}
        shakeKey={game.shake}
        onTap={game.tap}
      />
    </div>
  );

  const hud = (
    <Hud
      elapsed={game.elapsed}
      found={game.found.length}
      total={init.total}
      misses={game.misses}
      pings={game.pings}
      disabled={done}
      muted={game.muted}
      expanded={expanded}
      onPing={() => void game.ping()}
      onToggleMute={game.toggleMute}
      onToggleExpand={() => setExpanded((value) => !value)}
    />
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-3 pt-3 pb-28">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[15px] leading-none font-black tracking-[0.14em] text-[#F4EFE4]">
            WHAT CHANGED
          </h1>
          <p className="mt-1 text-[11px] text-slate-400">
            #{init.dayNumber} · {init.themeName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-bold text-[#FFC93C]">{streakLine(streakRecord)}</p>
          <p className="text-[10px] text-slate-500">
            {init.streak.tierName ? init.streak.tierName : init.streak.nextTier
              ? `${init.streak.nextTier.days}-day badge next`
              : 'new streak'}
          </p>
        </div>
      </header>

      {init.mode === 'practice' && (
        <p className="mb-2 rounded-lg border border-[#3E5A6B] bg-[#101d26] px-2 py-1 text-[10px] text-slate-300">
          Practice board — your scored run is already in the books.
        </p>
      )}

      {expanded ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[#0B141B] px-3 pt-3 pb-24">
          <div className="mx-auto w-full max-w-[640px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-[0.18em] text-slate-300">
                WHAT CHANGED #{init.dayNumber}
              </span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-lg border border-[#29414f] px-2 py-1 text-xs text-slate-300"
              >
                Close ✕
              </button>
            </div>
            {hud}
            {panels}
          </div>
        </div>
      ) : (
        <>
          {hud}
          {panels}
        </>
      )}

      <footer className="mt-3 text-center">
        <p className="text-[11px] font-semibold text-slate-300">
          Same place. Two moments. Find {init.total} changes.
        </p>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
          Tap a change in either panel. Wrong tap +2s · Ping +5s · hold a panel to magnify.
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Helping someone? Wrap it in <span className="text-slate-300">&gt;!spoiler!&lt;</span>.
        </p>
      </footer>

      {showResult && game.result && (
        <ResultCard
          result={game.result}
          mode={init.mode}
          streak={game.result.streak}
          snoozes={init.streak.snoozes}
          tierName={init.streak.tierName}
          snoovatar={init.snoovatar}
          onCopy={() => void game.shareCopy()}
          onComment={() => void game.shareComment()}
          onPractice={() => void game.practice()}
          onClose={() => setDismissed(true)}
        />
      )}

      {done && dismissed && (
        <button
          type="button"
          onClick={() => setDismissed(false)}
          className="fixed right-3 bottom-3 z-30 rounded-full bg-[#FFC93C] px-4 py-2 text-xs font-black text-[#20312B] shadow-lg"
        >
          Show result
        </button>
      )}

      {game.toast && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 rounded-lg border border-[#3E5A6B] bg-[#101d26] px-3 py-2 text-center text-[11px] text-slate-200 shadow-lg">
          {game.toast}
        </div>
      )}
    </main>
  );
}
