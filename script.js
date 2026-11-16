(async () => {
await window.portfolioReady;
'use strict';
// Projects and source video previews from kennymichael.site.
const projects = window.portfolioContent.projects;

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const grid=$('#project-grid');
projects.forEach((record,i)=>{const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const p=Object.fromEntries(Object.entries(record).map(([k,v])=>[k,typeof v==='string'?esc(v):v]));const card=document.createElement('button');card.type='button';card.className='project-card reveal';card.setAttribute('aria-haspopup','dialog');card.setAttribute('aria-label',`Explore ${p.name} — ${p.category}`);card.innerHTML=`<div class="project-image">${p.video ? `<video class="project-preview" data-src="${p.video}" poster="${p.image}" aria-label="${p.name} video preview" muted loop playsinline preload="none"></video>` : `<img src="${p.image}" alt="${p.name} website presentation" width="1200" height="900" loading="lazy">`}</div><div class="project-info"><div class="project-meta"><span>${String(i+1).padStart(2,'0')} / ${p.category}</span><span>${p.cardType || "WEBSITE"}</span></div><div class="project-title-row"><h3>${p.name}</h3><span class="project-arrow"><svg class="icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg></span></div><p>${p.summary}</p></div>`;card.addEventListener('click',()=>openProject(i));grid.append(card)});
let lastFocus=null;
function openDialog(dialog){const active=$('dialog[open]');if(active)active.close();lastFocus=document.activeElement;dialog.showModal();dialog.scrollTop=0;updatePreviewPlayback();}
function closeDialog(dialog){dialog.close();}
$$('dialog').forEach(dialog=>{
 $$('[data-close]',dialog).forEach(button=>button.addEventListener('click',()=>closeDialog(dialog)));
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog(dialog)}});
 dialog.addEventListener('close',()=>{updatePreviewPlayback();if(lastFocus?.isConnected)lastFocus.focus()});
 // Native dialog provides inert background and Escape; explicitly cycle focus.
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const focusable=$$('a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]',dialog).filter(el=>!el.hidden&&el.getClientRects().length);if(!focusable.length){event.preventDefault();return}const first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}});
});
$$('[data-enquiry]').forEach(button=>button.addEventListener('click',()=>openDialog($('#enquiry-modal'))));
let currentProject=0,currentImage=0;
function renderGallery(){const project=projects[currentProject];const image=$('#gallery-image');image.hidden=false;image.style.visibility='hidden';image.onload=()=>{image.style.visibility='visible'};image.src=project.caseImage;image.alt=project.caseImageAlt || `${project.name} — first image from the case study`;$('.gallery-controls').hidden=true;}

function renderProject(){const p=projects[currentProject];$('#project-title').textContent=p.name;$('#project-category').textContent=p.category;$('#project-description').textContent=p.description;$('#project-role').textContent=p.role;$('#project-timeline').textContent=p.timeline||'';$('#project-meta-label').textContent='TIMELINE';$('#project-timeline').parentElement.hidden=!p.timeline;renderCaseStudy(p);$('#project-live-link').hidden=!p.liveUrl;$('#project-live-link').href=p.liveUrl||'#';$('#project-live-link').textContent=p.liveLabel||'View Live Site';currentImage=0;renderGallery();$('#project-modal').scrollTop=0;}
function openProject(index){currentProject=index;renderProject();openDialog($('#project-modal'))}
function stepGallery(delta){currentImage=(currentImage+delta+projects[currentProject].gallery.length)%projects[currentProject].gallery.length;renderGallery()}
$('#gallery-prev').addEventListener('click',()=>stepGallery(-1));$('#gallery-next').addEventListener('click',()=>stepGallery(1));
$('#project-prev').addEventListener('click',()=>{currentProject=(currentProject+projects.length-1)%projects.length;renderProject()});$('#project-next').addEventListener('click',()=>{currentProject=(currentProject+1)%projects.length;renderProject()});
$('#project-modal').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();stepGallery(1)}if(e.key==='ArrowLeft'){e.preventDefault();stepGallery(-1)}});
$$('.accordion h3 button').forEach(button=>button.addEventListener('click',()=>{const expand=button.getAttribute('aria-expanded')!=='true';$$('.accordion h3 button').forEach(b=>{b.setAttribute('aria-expanded','false');$('#'+b.getAttribute('aria-controls')).inert=true});button.setAttribute('aria-expanded',String(expand));$('#'+button.getAttribute('aria-controls')).inert=!expand}));
if('IntersectionObserver' in window&&!reducedMotion.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('is-pending');observer.unobserve(entry.target)}}),{threshold:.08});$$('.reveal').forEach(el=>{el.classList.add('is-pending');observer.observe(el)});const statObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,target=Number(el.dataset.count),start=performance.now();function frame(now){const progress=Math.min((now-start)/1100,1);el.textContent=`${Math.round(target*(1-Math.pow(1-progress,3)))}+`;if(progress<1)requestAnimationFrame(frame)}requestAnimationFrame(frame);statObserver.unobserve(el)}),{threshold:.6});$$('[data-count]').forEach(el=>statObserver.observe(el));}
const backTop=$('.back-top');let scrollQueued=false;function updateScroll(){backTop.hidden=window.scrollY<650;scrollQueued=false}window.addEventListener('scroll',()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll)}},{passive:true});updateScroll();
$('.widget-close').addEventListener('click',()=>{$('.contact-widget').hidden=true});
$('#enquiry-form').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const data=new FormData(form);const name=data.get('name').trim(),email=data.get('email').trim(),description=data.get('description').trim(),service=data.get('service');if(!name||description.length<10){$('#form-status').textContent='Please add your name and at least 10 characters about the project.';return}const subject=`Project enquiry: ${service} — ${name}`;const body=`Hello Kenny,\n\nName: ${name}\nEmail: ${email}\nService required: ${service}\n\nProject description:\n${description}\n\nBest,\n${name}`;const url=`mailto:hello@kennymichael.site?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;const fallback=$('#email-fallback');fallback.href=url;fallback.hidden=false;$('#form-status').textContent='Your enquiry is prepared. Review and send it in your email app. If no app opens, use the link below or email hello@kennymichael.site.';window.location.href=url;});
$$('[data-social]').forEach(button=>button.addEventListener('click',()=>{$('#social-status').textContent=`Kenny’s ${button.dataset.social} profile link will be added soon. In the meantime, you can reach him by email.`;openDialog($('#social-modal'))}));

// Play muted thumbnails only while visible; honour reduced-motion preferences.
let previewsPaused=reducedMotion.matches;
const previewVisibility=new Map();
const previewVideos=$$('.project-preview');
function updatePreviewPlayback(){
 if(typeof previewVideos==='undefined')return;
 const overlayOpen=!!$('dialog[open]');
 previewVideos.forEach(video=>{
  const shouldPlay=!previewsPaused&&!document.hidden&&!overlayOpen&&previewVisibility.get(video);
  if(shouldPlay){if(!video.getAttribute('src')){video.src=video.dataset.src;video.load()}video.muted=true;video.play().catch(()=>{});}else video.pause();
 });
}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>previewVisibility.set(entry.target,entry.isIntersecting));updatePreviewPlayback()},{threshold:.12});previewVideos.forEach(video=>observer.observe(video));}else{previewVideos.forEach(video=>previewVisibility.set(video,true));}
reducedMotion.addEventListener('change',event=>{previewsPaused=event.matches;updatePreviewPlayback()});
document.addEventListener('visibilitychange',updatePreviewPlayback);
updatePreviewPlayback();

function renderCaseStudy(project){
 const study=project.caseStudy,body=$('#case-study-body'),contents=$('#case-study-contents');
 body.replaceChildren();contents.replaceChildren();
 $('#case-study-headline').textContent=study.headline;
 $('#case-study-intro').textContent=study.intro;
 $('#case-study-tools').textContent=study.tools;
 $('#case-study-type').textContent=study.projectType;
 study.sections.forEach((section,index)=>{
  const id=`case-section-${index}`;
  const jump=document.createElement('button');jump.type='button';jump.textContent=section.title;
  jump.addEventListener('click',()=>{const heading=$('#'+id+' h3');heading.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});heading.focus({preventScroll:true})});contents.append(jump);
  const container=document.createElement('section');container.id=id;container.className='modal-case-section';
  const label=document.createElement('span');label.className='case-number';label.textContent=String(index+1).padStart(2,'0');
  const content=document.createElement('div');content.className='modal-case-copy';
  const heading=document.createElement('h3');heading.textContent=section.title;heading.tabIndex=-1;content.append(heading);
  section.paragraphs.forEach(text=>{const paragraph=document.createElement('p');paragraph.textContent=text;content.append(paragraph)});
  container.append(label,content);
  section.images.forEach(asset=>{const figure=document.createElement('figure');figure.className='modal-case-figure'+(asset.portrait?' portrait':'');const image=document.createElement('img');image.src=asset.src;image.alt=asset.alt;image.loading='lazy';image.decoding='async';const caption=document.createElement('figcaption');caption.textContent=asset.alt;figure.append(image,caption);container.append(figure)});
  body.append(container);
 });
 $('#case-study-live-footer').href=project.liveUrl;$('#case-study-live-footer').textContent=project.liveLabel||'View Live Site';$('.case-study-end>span').textContent=project.cardType==='PRODUCT'?'EXPLORE THE PRODUCT':'EXPLORE THE FINISHED WEBSITE';
}


// Retain automatic previews while respecting data-saving preferences.
if(navigator.connection?.saveData){previewsPaused=true;updatePreviewPlayback()}
// Keep section navigation clear while scrolling.
if('IntersectionObserver' in window){const sectionObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('.desktop-nav a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}})},{rootMargin:'-20% 0px -60% 0px'});$$('main>section[id]').forEach(section=>sectionObserver.observe(section));}

// Original project previews double as direct invitations to explore the work.
$$('[data-feature-project]').forEach(card=>card.addEventListener('click',()=>openProject(Number(card.dataset.featureProject))));

// UI shots carousel
const shotsTrack=document.querySelector('.shots-track');
let shotsLoopWidth=0;
let shotsPaused=false;
let shotsFrame=0;
let shotsLastTime=0;
let shotsPosition=0;

const prepareShotsLoop=()=>{
  if(!shotsTrack||shotsTrack.dataset.loopReady)return;
  const originals=[...shotsTrack.querySelectorAll('.shot-slide')];
  if(!originals.length)return;
  const appendSet=()=>originals.forEach(slide=>{
    const clone=slide.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    clone.querySelector('img')?.setAttribute('alt','');
    shotsTrack.appendChild(clone);
  });
  appendSet();
  shotsLoopWidth=shotsTrack.children[originals.length].offsetLeft-shotsTrack.children[0].offsetLeft;
  while(shotsTrack.scrollWidth<shotsTrack.clientWidth+shotsLoopWidth)appendSet();
  shotsTrack.dataset.loopReady='true';
};

const animateShots=time=>{
  if(!shotsTrack)return;
  if(!shotsLastTime)shotsLastTime=time;
  const elapsed=Math.min(time-shotsLastTime,1000);
  shotsLastTime=time;
  if(!shotsPaused&&shotsLoopWidth){
    shotsPosition+=elapsed*.018;
    if(shotsPosition>=shotsLoopWidth)shotsPosition-=shotsLoopWidth;
    shotsTrack.scrollLeft=shotsPosition;
  }
  shotsFrame=requestAnimationFrame(animateShots);
};

const scrollShots=direction=>{
  if(!shotsTrack)return;
  const slide=shotsTrack.querySelector('.shot-slide');
  if(!slide)return;
  const distance=slide.getBoundingClientRect().width+parseFloat(getComputedStyle(shotsTrack).gap||0);
  shotsPosition+=direction*distance;
  if(shotsLoopWidth){
    while(shotsPosition<0)shotsPosition+=shotsLoopWidth;
    while(shotsPosition>=shotsLoopWidth)shotsPosition-=shotsLoopWidth;
  }
  shotsTrack.scrollLeft=shotsPosition;
};

if(shotsTrack){
  prepareShotsLoop();
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  shotsPaused=reducedMotion.matches;
  reducedMotion.addEventListener?.('change',event=>{shotsPaused=event.matches});
  document.addEventListener('visibilitychange',()=>{shotsPaused=document.hidden||reducedMotion.matches});
  shotsFrame=requestAnimationFrame(animateShots);
}
document.querySelector('#shots-prev')?.addEventListener('click',()=>scrollShots(-1));
document.querySelector('#shots-next')?.addEventListener('click',()=>scrollShots(1));

})();
