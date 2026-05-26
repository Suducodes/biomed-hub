// Entry point — boots background, nav, palette, and registers routes.

import { renderNav, renderStreakCard, setupPalette, setupMenu, setupKeybinds, startBackground } from './ui.js';
import { route, startRouter } from './router.js';
import { touchStreak, loadManifest } from './storage.js';

import { renderDashboard } from './pages/dashboard.js';
import { renderCurriculum, renderYear, renderSemester, renderSubject } from './pages/curriculum.js';
import { renderNotes, renderNoteEditor, renderNoteView } from './pages/notes.js';
import { renderPapers } from './pages/papers.js';
import { renderFlashcards } from './pages/flashcards.js';
import { renderPomodoro } from './pages/pomodoro.js';
import { renderECG, stopECG } from './pages/ecg.js';
import { renderRhythm, stopRhythm } from './pages/rhythm.js';
import { renderWhiteboard } from './pages/whiteboard.js';
import { renderAbout } from './pages/about.js';
import { renderCalculators } from './pages/calculators.js';
import { renderMindmap } from './pages/mindmap.js';
import { renderGlossary } from './pages/glossary.js';
import { renderForum, renderThread } from './pages/forum.js';
import { renderCalendar } from './pages/calendar.js';
import { renderBuddy } from './pages/buddy.js';
import { renderBookmarks } from './pages/bookmarks.js';
import { renderStats } from './pages/stats.js';
import { renderAdmin } from './pages/admin.js';
import { renderTools } from './pages/tools.js';
import { renderSim, stopSim } from './pages/sim.js';
import { renderLabs, renderLab } from './pages/labs.js';
import { renderSandbox } from './pages/sandbox.js';

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
