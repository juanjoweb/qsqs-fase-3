'use strict';

const bank = window.QSQS;
const keys = window.QSQS_CLAVES;
const storageKey = 'qsqs-2026-fase-3-v1';
const $ = id => document.getElementById(id);
const grade = $('grade');
const area = $('area');
const letter = index => String.fromCharCode(65 + index);
let index = 0;
let reviewing = false;
let answers = {};

try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) answers = saved;
} catch {
  // The current attempt still works when the browser disables local storage.
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(answers));
  } catch {
    // Answers remain available during this session.
  }
}

function setChoices(select, choices) {
  select.replaceChildren(...choices.map(choice => new Option(choice.label, choice.id)));
}

function currentGrade() {
  return bank.find(test => test.id === Number(grade.value));
}

function currentArea() {
  return currentGrade().areas.find(section => section.id === Number(area.value));
}

function selected(item) {
  return item.options.findIndex(option => option.id === answers[item.id]);
}

function proposedLetters(item, entry) {
  return item.options.flatMap((option, position) =>
    entry.optionIds.includes(option.id) ? [letter(position)] : []
  );
}

function keySummary(item, entry) {
  const proposals = proposedLetters(item, entry);
  return proposals.length ? 'Clave propuesta: ' + proposals.join(' o ') + '.' : 'Ninguna opción válida.';
}

function feedback(item) {
  const choice = selected(item);
  if (choice < 0) return '';
  const entry = keys[item.id];
  const selection = 'Seleccionaste ' + letter(choice) + '.';
  if (!entry) return selection;
  const summary = keySummary(item, entry);
  if (entry.review) return selection + ' ' + summary + ' ' + entry.review;
  if (entry.optionIds.includes(answers[item.id])) return 'Tu respuesta coincide con la clave propuesta.';
  return selection + ' ' + summary;
}

function goTo(position) {
  index = position;
  reviewing = false;
  render();
  $('position').focus();
}

function renderNavigation(items) {
  const count = items.filter(item => selected(item) >= 0).length;
  $('progressText').textContent = count + ' de ' + items.length + ' respondidas';
  $('progress').max = items.length;
  $('progress').value = count;
  $('jump').replaceChildren(...items.map((item, position) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = position + 1;
    const answered = selected(item) >= 0;
    button.setAttribute('aria-label', 'Pregunta ' + (position + 1) + (answered ? ', respondida' : ', sin responder'));
    if (answered) button.dataset.answered = '';
    if (position === index && !reviewing) button.setAttribute('aria-current', 'step');
    button.addEventListener('click', () => goTo(position));
    return button;
  }));
}

function renderQuestion(items) {
  const item = items[index];
  $('position').textContent = 'Pregunta ' + (index + 1) + ' de ' + items.length;
  $('reviewFlag').hidden = !keys[item.id]?.review;
  $('contextBlock').hidden = !item.context.trim();
  $('contextTitle').textContent = item.title;
  $('context').innerHTML = item.context;
  $('prompt').innerHTML = item.prompt;
  $('options').replaceChildren(...item.options.map((option, position) => {
    const label = document.createElement('label');
    label.className = 'option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'answer';
    radio.checked = option.id === answers[item.id];
    const mark = document.createElement('strong');
    mark.textContent = letter(position) + '.';
    const content = document.createElement('div');
    content.innerHTML = option.html;
    label.append(radio, mark, content);
    radio.addEventListener('change', () => {
      answers[item.id] = option.id;
      save();
      renderNavigation(items);
      $('feedback').textContent = feedback(item);
    });
    return label;
  }));
  $('feedback').textContent = feedback(item);
  $('previous').disabled = index === 0;
  $('next').textContent = index === items.length - 1 ? 'Revisar respuestas' : 'Siguiente';
}

function renderReview(section) {
  const items = section.items;
  const graded = items.filter(item => keys[item.id]?.optionIds.length > 0 && !keys[item.id].review);
  const hits = graded.filter(item => keys[item.id].optionIds.includes(answers[item.id])).length;
  const flagged = items.filter(item => keys[item.id]?.review).length;
  const reviewText = flagged ? ' · Por revisar: ' + flagged + ' (fuera del puntaje).' : '';
  $('reviewStatus').textContent = section.id === 3
    ? 'Consulta tus respuestas al cuestionario socioemocional.'
    : 'Aciertos según la clave propuesta: ' + hits + ' de ' + graded.length + '.' + reviewText;
  $('reviewFilter').hidden = flagged === 0;
  const onlyFlagged = flagged > 0 && $('onlyFlagged').checked;
  $('reset').disabled = !items.some(item => selected(item) >= 0);
  $('reviewList').replaceChildren(...items.flatMap((item, position) => {
    const entry = keys[item.id];
    if (onlyFlagged && !entry?.review) return [];
    const row = document.createElement('li');
    row.value = position + 1;
    const button = document.createElement('button');
    const choice = selected(item);
    button.type = 'button';
    button.textContent = 'Pregunta ' + (position + 1);
    button.addEventListener('click', () => goTo(position));
    const choiceText = choice < 0 ? 'Sin responder' : 'Tu respuesta: ' + letter(choice);
    const keyText = entry ? ' · ' + keySummary(item, entry) : '';
    row.append(button, '  ' + choiceText + keyText);
    if (entry?.review) {
      const note = document.createElement('p');
      note.className = 'review-note';
      const flag = document.createElement('strong');
      flag.className = 'review-flag';
      flag.textContent = 'Por revisar';
      note.append(flag, ' ' + entry.review);
      row.append(note);
    }
    return [row];
  }));
}

function render() {
  const section = currentArea();
  $('keyNotice').hidden = section.id === 3;
  $('questionView').hidden = reviewing;
  $('reviewView').hidden = !reviewing;
  renderNavigation(section.items);
  if (reviewing) renderReview(section);
  else renderQuestion(section.items);
}

function showReview() {
  reviewing = true;
  render();
  $('reviewTitle').focus();
}

function switchArea() {
  index = 0;
  reviewing = false;
  $('onlyFlagged').checked = false;
  render();
}

setChoices(grade, bank);
setChoices(area, currentGrade().areas);
grade.addEventListener('change', () => {
  const previousArea = area.value;
  setChoices(area, currentGrade().areas);
  if (currentGrade().areas.some(section => String(section.id) === previousArea)) area.value = previousArea;
  switchArea();
});
area.addEventListener('change', switchArea);
$('previous').addEventListener('click', () => goTo(index - 1));
$('next').addEventListener('click', () => {
  if (index === currentArea().items.length - 1) showReview();
  else goTo(index + 1);
});
$('review').addEventListener('click', showReview);
$('onlyFlagged').addEventListener('change', () => renderReview(currentArea()));
$('back').addEventListener('click', () => goTo(index));
$('reset').addEventListener('click', () => {
  if (!confirm('¿Borrar tus respuestas de este grado y área?')) return;
  currentArea().items.forEach(item => delete answers[item.id]);
  save();
  goTo(0);
});
render();
