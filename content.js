'use strict';
// Shared live content also works when these frontend files are hosted on Vercel.
window.PORTFOLIO_API='https://kenny-michael-editorial.thekenmichael.chatgpt.site';
window.portfolioReady=(async()=>{
 let data;
 try{const r=await fetch(window.PORTFOLIO_API+'/api/content',{cache:'no-store'});if(!r.ok)throw Error();data=await r.json();}
 catch(_){const r=await fetch('content-fallback.json');data=await r.json();}
 window.portfolioContent=data;
 const populate=(container,cls)=>{if(!container)return;container.replaceChildren();data.shots.forEach(s=>{const box=document.createElement('div');box.className=cls;const img=document.createElement('img');img.src=s.src;img.alt=s.alt||'UI design';img.loading='lazy';box.append(img);container.append(box)})};
 populate(document.querySelector('.shots-track'),'shot-slide');
 populate(document.querySelector('.masonry-gallery'),'masonry-item');
 const groups=document.querySelectorAll('.hero-shots-group');
 groups.forEach(g=>g.replaceChildren());
 (data.hero||[]).forEach(s=>groups.forEach((g,i)=>{const box=document.createElement('div');box.className='hero-shot '+(s.layout==='project'?'hero-project-shot':'hero-concept-shot');const img=document.createElement('img');img.src=s.src;img.alt=i?'':s.alt;box.append(img);g.append(box)}));
})();
