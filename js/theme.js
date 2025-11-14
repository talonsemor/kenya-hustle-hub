
const themeBtn = document.getElementById('themeToggle');
const mpesaNum = document.getElementById('mpesaNum');
if(themeBtn){ themeBtn.addEventListener('click', ()=>{ document.body.classList.toggle('light'); document.body.classList.toggle('dark'); }); }
if(mpesaNum){ mpesaNum.textContent = '0700 000 000'; }
