'use strict';
document.querySelectorAll('.page-menu').forEach(menu=>{
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>menu.removeAttribute('open')));
  document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))menu.removeAttribute('open')});
  window.matchMedia('(min-width: 761px)').addEventListener('change',event=>{if(event.matches)menu.removeAttribute('open')});
});
