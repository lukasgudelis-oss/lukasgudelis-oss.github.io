document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cv-feedback-form');
  if (!form) return;
  const send = document.getElementById('cv-send');
  const clear = document.getElementById('cv-clear');
  const result = document.getElementById('cv-feedback-result');
  const dataList = document.getElementById('cv-feedback-data');
  const average = document.getElementById('cv-feedback-average');
  const ids = ['cv-first', 'cv-middle', 'cv-last', 'cv-email', 'cv-phone', 'cv-address'];
  const required = ids.filter(id => id !== 'cv-middle');
  const fields = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  const touched = new Set();
  const ratings = [...form.querySelectorAll('input[type="range"]')];
  const errors = {'cv-first':'err-first','cv-middle':'err-middle','cv-last':'err-last','cv-email':'err-email','cv-phone':'err-phone','cv-address':'err-address'};
  const lettersOnly = /^\p{L}+$/u;
  const country = document.getElementById('cv-country');
  const phone = fields['cv-phone'];
  const countries = {
    LT: {dial:'+370', max:8, min:8, valid:/^6\d{7}$/, example:'600 00000'},
    LV: {dial:'+371', max:8, min:8, valid:/^[2-9]\d{7}$/, example:'2000 0000'},
    EE: {dial:'+372', max:8, min:7, valid:/^\d{7,8}$/, example:'5123 4567'},
    PL: {dial:'+48', max:9, min:9, valid:/^\d{9}$/, example:'500 000 000'},
    DE: {dial:'+49', max:13, min:7, valid:/^\d{7,13}$/, example:'151 23456789'},
    GB: {dial:'+44', max:10, min:10, valid:/^7\d{9}$/, example:'7700 900123'},
    US: {dial:'+1', max:10, min:10, valid:/^[2-9]\d{2}[2-9]\d{6}$/, example:'202 555 0123'}
  };
  function cfg(){ return countries[country.value]; }
  function phoneDigits(){ return phone.value.replace(/\D/g,''); }
  function formatPhone(raw){
    let digits=raw.replace(/\D/g,'');
    const prefix=cfg().dial.slice(1);
    if(digits.startsWith(prefix) && (raw.trim().startsWith('+') || digits.length>cfg().max)) digits=digits.slice(prefix.length);
    if(country.value==='LT' && digits.length===9 && digits.startsWith('0')) digits=digits.slice(1);
    digits=digits.slice(0,cfg().max);
    if(country.value==='LT') return digits.slice(0,3)+(digits.length>3?' '+digits.slice(3):'');
    return digits;
  }
  function errorFor(id){
    const v=fields[id].value.trim();
    if(!v && required.includes(id)) return 'Šis laukas privalomas.';
    if(['cv-first','cv-middle','cv-last'].includes(id) && v && !lettersOnly.test(v)) return 'Leidžiamos tik raidės, be tarpų ir simbolių.';
    if(id==='cv-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Įveskite teisingą el. pašto adresą.';
    if(id==='cv-phone' && !cfg().valid.test(phoneDigits())) return 'Neteisingas numeris. Pavyzdys: '+cfg().dial+' '+cfg().example;
    return '';
  }
  function check(showAll=false){
    let valid=true;
    for(const id of ids){
      const message=errorFor(id);
      if(message) valid=false;
      const show=showAll||touched.has(id);
      fields[id].classList.toggle('cv-invalid',Boolean(message&&show));
      fields[id].setAttribute('aria-invalid',String(Boolean(message&&show)));
      document.getElementById(errors[id]).textContent=show?message:'';
    }
    for(const input of ratings){const v=Number(input.value);if(!Number.isInteger(v)||v<1||v>10)valid=false;}
    send.disabled=!valid;
    return valid;
  }
  for(const id of ids){
    fields[id].addEventListener('input',()=>{
      touched.add(id);
      if(['cv-first','cv-middle','cv-last'].includes(id)) fields[id].value=fields[id].value.replace(/[^\p{L}]/gu,'');
      if(id==='cv-phone')phone.value=formatPhone(phone.value);
      check();
    });
    fields[id].addEventListener('blur',()=>{touched.add(id);check();});
  }
  country.addEventListener('change',()=>{
    phone.value='';phone.placeholder=cfg().example;phone.maxLength=cfg().max+3;
    touched.delete('cv-phone');check();
  });
  for(const input of ratings){
    const output=form.querySelector(`output[for="${input.id}"]`);
    input.addEventListener('input',()=>{output.textContent=input.value;check();});
  }
  function addRow(label,value){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=value;dataList.append(dt,dd);}
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!check(true))return;
    const info={
      vardas:fields['cv-first'].value.trim(),
      antrasVardas:fields['cv-middle'].value.trim(),
      pavarde:fields['cv-last'].value.trim(),
      elPastas:fields['cv-email'].value.trim(),
      salis:country.options[country.selectedIndex].text,
      telefonas:cfg().dial+' '+phone.value.trim(),
      adresas:fields['cv-address'].value.trim(),
      vertinimai:{dizainas:Number(ratings[0].value),projektai:Number(ratings[1].value),patogumas:Number(ratings[2].value)}
    };
    console.log('11 LD formos duomenys:',info);
    dataList.replaceChildren();
    addRow('Vardas:',info.vardas);
    if(info.antrasVardas)addRow('Antras vardas:',info.antrasVardas);
    addRow('Pavardė:',info.pavarde);
    addRow('El. paštas:',info.elPastas);
    addRow('Šalis:',info.salis);
    addRow('Tel. numeris:',info.telefonas);
    addRow('Adresas:',info.adresas);
    addRow('Dizaino įvertinimas:',info.vertinimai.dizainas+'/10');
    addRow('Projektų įvertinimas:',info.vertinimai.projektai+'/10');
    addRow('Patogumo įvertinimas:',info.vertinimai.patogumas+'/10');
    const mean=(info.vertinimai.dizainas+info.vertinimai.projektai+info.vertinimai.patogumas)/3;
    average.textContent=`${[info.vardas,info.antrasVardas,info.pavarde].filter(Boolean).join(' ')}: ${mean.toFixed(2).replace('.',',')}`;
    result.hidden=false;
  });
  clear.addEventListener('click',()=>{
    form.reset();touched.clear();phone.placeholder=cfg().example;
    for(const input of ratings)form.querySelector(`output[for="${input.id}"]`).textContent=input.value;
    dataList.replaceChildren();average.textContent='';result.hidden=true;check();
  });
  phone.placeholder=cfg().example;check();
});
