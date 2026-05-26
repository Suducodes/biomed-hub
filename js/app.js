// Entry point — boots background, nav, palette, and registers routes.

import { renderNav, renderStreakCard, setupPalette, setupMenu, setupKeybinds, startBackground } from './ui.js?v=5f017ca';
import { route, startRouter } from './router.js?v=5f017ca';
import { touchStreak, loadManifest } from './storage.js?v=5f017ca';

import { renderDashboard } from './pages/dashboard.js?v=5f017ca';
import { renderCurriculum, renderYear, renderSemester, renderSubject } from './pages/curriculum.js?v=5f017ca';
import { renderNotes, renderNoteEditor, renderNoteView } from './pages/notes.js?v=5f017ca';
import { renderPapers } from './pages/papers.js?v=5f017ca';
import { renderFlashcards } from './pages/flashcards.js?v=5f017ca';
import { renderPomodoro } from './pages/pomodoro.js?v=5f017ca';
import { renderECG, stopECG } from './pages/ecg.js?v=5f017ca';
import { renderRhythm, stopRhythm } from './pages/rhythm.js?v=5f017ca';
import { renderWhiteboard } from './pages/whiteboard.js?v=5f017ca';
import { renderAbout } from './pages/about.js?v=5f017ca';
import { renderCalculators } from './pages/calculators.js?v=5f017ca';
import { renderMindmap } from './pages/mindmap.js?v=5f017ca';
import { renderGlossary } from './pages/glossary.js?v=5f017ca';
import { renderForum, renderThread } from './pages/forum.js?v=5f017ca';
import { renderCalendar } from './pages/calendar.js?v=5f017ca';
import { renderBuddy } from './pages/buddy.js?v=5f017ca';
import { renderBookmarks } from './pages/bookmarks.js?v=5f017ca';
import { renderStats } from './pages/stats.js?v=5f017ca';
import { renderAdmin } from './pages/admin.js?v=5f017ca';
import { renderTools } from './pages/tools.js?v=5f017ca';
import { renderSim, stopSim } from './pages/sim.js?v=5f017ca';
import { renderLabs, renderLab } from './pages/labs.js?v=5f017ca';

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

  // Routes
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
