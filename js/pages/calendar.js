import { h, mount } from '../ui.js';
import { store, uid, toast } from '../storage.js';

export function renderCalendar() {
  let cursor = new Date();
  cursor.setDate(1);

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: '<span class="accent">Study</span> Calendar' }),
      h('p', {}, 'Plan exams, assignments and revision blocks. Future you is grateful.'),
    ),
  );

  const cal = h('div', { class: 'cal' });

  function render() {
    cal.innerHTML = '';
    const monthName = cursor.toLocaleString('en', { month: 'long', year: 'numeric' });
    const head = h('div', { class: 'cal__head' },
      h('h3', {}, monthName),
      h('button', { class: 'btn btn--ghost btn--sm', onclick: () => { cursor.setMonth(cursor.getMonth() - 1); render(); } }, '←'),
      h('button', { class: 'btn btn--ghost btn--sm', onclick: () => { cursor = new Date(); cursor.setDate(1); render(); } }, 'Today'),
      h('button', { class: 'btn btn--ghost btn--sm', onclick: () => { cursor.setMonth(cursor.getMonth() + 1); render(); } }, '→'),
      h('button', { class: 'btn btn--primary btn--sm', onclick: addEvent }, '+ Event'),
    );
    cal.appendChild(head);

    const grid = h('div', { class: 'cal__grid' });
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(d => grid.appendChild(h('div', { class: 'dow' }, d)));

    const first = new Date(cursor); first.setDate(1);
    const startDow = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const prevDays = new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate();

    const todayStr = new Date().toISOString().slice(0, 10);
    const events = store.events();

    // Prev month tail
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - 1, prevDays - i);
      grid.appendChild(cell(d, true, todayStr, events));
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      grid.appendChild(cell(d, false, todayStr, events));
    }
    // Fill to 6 weeks
    const total = startDow + daysInMonth;
    const tail = (7 - (total % 7)) % 7;
    for (let i = 1; i <= tail; i++) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() + 1, i);
      grid.appendChild(cell(d, true, todayStr, events));
    }

    cal.appendChild(grid);
  }

  function cell(d, other, today, events) {
    const iso = d.toISOString().slice(0, 10);
    const ev = events.filter(e => e.date === iso);
    return h('div', { class: 'cal__cell' + (other ? ' is-other' : '') + (iso === today ? ' is-today' : '') },
      h('div', { class: 'num' }, d.getDate()),
      ...ev.map(e => h('div', { class: 'ev ' + e.type, title: e.title }, e.title)),
    );
  }

  function addEvent() {
    const date = prompt('Date (YYYY-MM-DD)?', new Date().toISOString().slice(0, 10));
    if (!date) return;
    const title = prompt('Title?'); if (!title) return;
    const type = prompt('Type (exam, assign, other)?', 'other');
    const events = [...store.events(), { id: uid(), date, title, type: type || 'other' }];
    store.set('events', events);
    toast('Event added');
    render();
  }

  mount('#view', head, cal);
  render();
}
