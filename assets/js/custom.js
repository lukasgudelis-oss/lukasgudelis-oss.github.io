document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cv-feedback-form');
  if (!form) return;
  const send = document.getElementById('cv-send');
  const clear = document.getElementById('cv-clear');
  const result = document.getElementById('cv-feedback-result');
  const dataList = document.getElementById('cv-feedback-data');
  const average = document.getElementById('cv-feedback-average');
  const ids = ['cv-first', 'cv-last', 'cv-email', 'cv-phone', 'cv-address'];
  const fields = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const touched = new Set();
  const ratings = [...form.querySelectorAll('input[type="range"]')];
  const errors = {
    'cv-first': 'err-first', 'cv-last': 'err-last', 'cv-email': 'err-email',
    'cv-phone': 'err-phone', 'cv-address': 'err-address'
  };
  const letters = /^[\p{L}]+(?:[ '\u2019-][\p{L}]+)*$/u;
  const phone = fields['cv-phone'];

  function formatPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('370')) digits = digits.slice(3);
    else if (digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0, 8);
    if (!digits) return '';
    return '+370 ' + digits.slice(0, 3) + (digits.length > 3 ? ' ' + digits.slice(3) : '');
  }
  function errorFor(id) {
    const v = fields[id].value.trim();
    if (!v) return 'Šis laukas privalomas.';
    if ((id === 'cv-first' || id === 'cv-last') && !letters.test(v)) return 'Naudokite tik raides.';
    if (id === 'cv-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Įveskite teisingą el. pašto adresą.';
    if (id === 'cv-phone' && !/^\+370 6\d{2} \d{5}$/.test(v)) return 'Formatas: +370 6xx xxxxx.';
    return '';
  }
  function check(showAll = false) {
    let valid = true;
    for (const id of ids) {
      const message = errorFor(id);
      if (message) valid = false;
      const show = showAll || touched.has(id);
      const field = fields[id];
      field.classList.toggle('cv-invalid', !!message && show);
      field.setAttribute('aria-invalid', String(!!message && show));
      document.getElementById(errors[id]).textContent = show ? message : '';
    }
    for (const input of ratings) {
      const value = Number(input.value);
      if (!Number.isInteger(value) || value < 1 || value > 10) valid = false;
    }
    send.disabled = !valid;
    return valid;
  }
  for (const id of ids) {
    fields[id].addEventListener('input', () => {
      touched.add(id);
      if (id === 'cv-phone') phone.value = formatPhone(phone.value);
      check();
    });
    fields[id].addEventListener('blur', () => { touched.add(id); check(); });
  }
  for (const input of ratings) {
    const output = form.querySelector(`output[for="${input.id}"]`);
    input.addEventListener('input', () => { output.textContent = input.value; check(); });
  }
  function addRow(label, value) {
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    dataList.append(dt, dd);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!check(true)) return;
    const info = {
      vardas: fields['cv-first'].value.trim(),
      pavarde: fields['cv-last'].value.trim(),
      elPastas: fields['cv-email'].value.trim(),
      telefonas: fields['cv-phone'].value.trim(),
      adresas: fields['cv-address'].value.trim(),
      vertinimai: {
        dizainas: Number(ratings[0].value),
        projektai: Number(ratings[1].value),
        patogumas: Number(ratings[2].value)
      }
    };
    console.log('11 LD formos duomenys:', info);
    dataList.replaceChildren();
    addRow('Vardas:', info.vardas);
    addRow('Pavardė:', info.pavarde);
    addRow('El. paštas:', info.elPastas);
    addRow('Tel. numeris:', info.telefonas);
    addRow('Adresas:', info.adresas);
    addRow('Dizaino įvertinimas:', info.vertinimai.dizainas + '/10');
    addRow('Projektų įvertinimas:', info.vertinimai.projektai + '/10');
    addRow('Patogumo įvertinimas:', info.vertinimai.patogumas + '/10');
    const mean = (info.vertinimai.dizainas + info.vertinimai.projektai + info.vertinimai.patogumas) / 3;
    average.textContent = `${info.vardas} ${info.pavarde}: ${mean.toFixed(2).replace('.', ',')}`;
    result.hidden = false;
  });
  clear.addEventListener('click', () => {
    form.reset();
    touched.clear();
    for (const input of ratings) form.querySelector(`output[for="${input.id}"]`).textContent = input.value;
    dataList.replaceChildren();
    average.textContent = '';
    result.hidden = true;
    check();
  });
  check();
});
