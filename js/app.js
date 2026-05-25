// Entry point — boots background, nav, palette, and registers routes.

import { renderNav, renderStreakCard, setupPalette, setupMenu, setupKeybinds, startBackground } from './ui.js?v=7cbd43e';
import { route, startRouter } from './router.js?v=7cbd43e';
import { touchStreak, loadManifest } from './storage.js?v=7cbd43e';

import { renderDashboard } from './pages/dashboard.js?v=7cbd43e';
import { renderCurriculum, renderYear, renderSemester, renderSubject } from './pages/curriculum.js?v=7cbd43e';
import { renderNotes, renderNoteEditor, renderNoteView } from './pages/notes.js?v=7cbd43e';
import { renderPapers } from './pages/papers.js?v=7cbd43e';
import { renderFlashcards } from './pages/flashcards.js?v=7cbd43e';
import { renderPomodoro } from './pages/pomodoro.js?v=7cbd43e';
import { renderECG, stopECG } from './pages/ecg.js?v=7cbd43e';
import { renderRhythm, stopRhythm } from './pages/rhythm.js?v=7cbd43e';
import { renderWhiteboard } from './pages/whiteboard.js?v=7cbd43e';
import { renderAbout } from './pages/about.js?v=7cbd43e';
import { renderCalculators } from './pages/calculators.js?v=7cbd43e';
import { renderMindmap } from './pages/mindmap.js?v=7cbd43e';
import { renderGlossary } from './pages/glossary.js?v=7cbd43e';
import { renderForum, renderThread } from './pages/forum.js?v=7cbd43e';
import { renderCalendar } from './pages/calendar.js?v=7cbd43e';
import { renderBuddy } from './pages/buddy.js?v=7cbd43e';
import { renderBookmarks } from './pages/bookmarks.js?v=7cbd43e';
import { renderStats } from './pages/stats.js?v=7cbd43e';
import { renderAdmin } from './pages/admin.js?v=7cbd43e';

async function boot() {
  startBackground();
  renderNav();
  renderStreakCard();
  setupPalette();
  setupMenu();
  setupKeybinds();
  touchStreak();
  // Pre-fetch manifest so dashboard renders accurate counts on first paint.
  loadManifest();

  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#/ecg'))    stopECG();
    if (!location.hash.startsWith('#/rhythm')) stopRhythm();
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
