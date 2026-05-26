// Entry point — boots background, nav, palette, and registers routes.

import { renderNav, renderStreakCard, setupPalette, setupMenu, setupKeybinds, startBackground } from './ui.js?v=960a27c';
import { route, startRouter } from './router.js?v=960a27c';
import { touchStreak, loadManifest } from './storage.js?v=960a27c';

import { renderDashboard } from './pages/dashboard.js?v=960a27c';
import { renderCurriculum, renderYear, renderSemester, renderSubject } from './pages/curriculum.js?v=960a27c';
import { renderNotes, renderNoteEditor, renderNoteView } from './pages/notes.js?v=960a27c';
import { renderPapers } from './pages/papers.js?v=960a27c';
import { renderFlashcards } from './pages/flashcards.js?v=960a27c';
import { renderPomodoro } from './pages/pomodoro.js?v=960a27c';
import { renderECG, stopECG } from './pages/ecg.js?v=960a27c';
import { renderRhythm, stopRhythm } from './pages/rhythm.js?v=960a27c';
import { renderWhiteboard } from './pages/whiteboard.js?v=960a27c';
import { renderAbout } from './pages/about.js?v=960a27c';
import { renderCalculators } from './pages/calculators.js?v=960a27c';
import { renderMindmap } from './pages/mindmap.js?v=960a27c';
import { renderGlossary } from './pages/glossary.js?v=960a27c';
import { renderForum, renderThread } from './pages/forum.js?v=960a27c';
import { renderCalendar } from './pages/calendar.js?v=960a27c';
import { renderBuddy } from './pages/buddy.js?v=960a27c';
import { renderBookmarks } from './pages/bookmarks.js?v=960a27c';
import { renderStats } from './pages/stats.js?v=960a27c';
import { renderAdmin } from './pages/admin.js?v=960a27c';
import { renderTools } from './pages/tools.js?v=960a27c';
import { renderSim, stopSim } from './pages/sim.js?v=960a27c';
import { renderLabs, renderLab } from './pages/labs.js?v=960a27c';
import { renderSandbox } from './pages/sandbox.js?v=960a27c';

async function boot() {
  startBackground();
  renderNav();
  renderStreakCard();
  setupPalette();
  setupMenu();
  setupKeybinds();
  touchStreak();
  loadManifest();

  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#/ecg'))    stopECG();
    if (!location.hash.startsWith('#/rhythm')) stopRhythm();
    if (!location.hash.startsWith('#/sim'))    stopSim();
  });

  route('#/',                       renderDashboard);
  route('#/curriculum',             renderCurriculum);
  route('#/curriculum/year/:y',     renderYear);
  route('#/curriculum/sem/:n',      renderSemester);
  route('#/subject/:id',            renderSubject);

  route('#/notes',                  renderNotes);
  route('#/notes/new',              () => renderNoteEditor({ id: 'new' }));
  route('#/notes/:id',              renderNoteView);
  route('#/notes/:id/edit',         renderNoteEditor);

  route('#/papers',                 renderPapers);

  route('#/flashcards',             renderFlashcards);
  route('#/pomodoro',               renderPomodoro);
  route('#/ecg',                    renderECG);
  route('#/rhythm',                 renderRhythm);
  route('#/whiteboard',             renderWhiteboard);
  route('#/calc',                   renderCalculators);
  route('#/mindmap',                renderMindmap);
  route('#/glossary',               renderGlossary);
  route('#/about',                  renderAbout);
  route('#/tools',                  renderTools);
  route('#/sim/phet/:id',           ({ id }) => renderSim({ kind: 'phet', id }));
  route('#/sim/:id',                ({ id }) => renderSim({ kind: 'builtin', id }));
  route('#/labs',                   renderLabs);
  route('#/lab/:id',                renderLab);
  route('#/sandbox',                renderSandbox);

  route('#/forum',                  renderForum);
  route('#/forum/:id',              renderThread);
  route('#/calendar',               renderCalendar);
  route('#/buddy',                  renderBuddy);
  route('#/bookmarks',              renderBookmarks);
  route('#/stats',                  renderStats);
  route('#/admin',                  renderAdmin);

  startRouter();
}

boot();
