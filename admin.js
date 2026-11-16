'use strict';
const hosted='https://kenny-michael-editorial.thekenmichael.chatgpt.site';
if(location.origin!==hosted&&!['localhost','127.0.0.1'].includes(location.hostname))location.replace(hosted+'/admin.html');
const $=s=>document.querySelector(s),form=$('#edit-form'),editor=$('#editor');let data,kind='projects',current,dirty=false,uploading=0;
async function api(path,options={}){const response=await fetch('/api/'+path,{cache:'no-store',...options});const result=await response.json();if(!response.ok)throw Error(result.error||'Request failed');return result}
function field(name){return form.elements.namedItem(name)}
function set(name,value){field(name).value=value??''}
function make(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e}
function status(message){$('#save-status').textContent=message}
function render(){
 $('#project-count').textContent=data.projects.length;$('#shot-count').textContent=data.shots.length;$('#hero-count').textContent=data.hero.length;
 $('#add').textContent=kind==='projects'?'+ Add project':kind==='hero'?'+ Add hero image':'+ Add UI shot';$('#items').replaceChildren();
 data[kind].slice().sort((a,b)=>a.order-b.order).forEach(item=>{const card=make('article',null,'studio-item'+(kind!=='projects'?' shot':'')),img=make('img');img.src=item.image||item.src;img.alt=item.name||item.alt||'UI shot';img.loading='lazy';const body=make('div');body.append(make('span',item.published?'Published':'Draft','badge'+(item.published?' live':'')),make('h2',item.name||item.alt||'UI shot'),make('small',kind==='projects'?item.category:(kind==='hero'?'Hero carousel · Order '+item.order:'Gallery and homepage carousel')));const button=make('button','Edit');button.onclick=()=>open(item);body.append(button);card.append(img,body);$('#items').append(card)});
 if(!data[kind].length)$('#items').append(make('p','Nothing here yet. Add your first '+(kind==='projects'?'project.':kind==='hero'?'hero image.':'UI shot.')));
}
function section(s={title:'',paragraphs:[],images:[]}){
 const box=make('div',null,'case-editor');box.assets=structuredClone(s.images||[]);
 const titleLabel=make('label','Section heading'),title=make('input');title.className='section-title';title.value=s.title;titleLabel.append(title);
 const copyLabel=make('label','Section text'),copy=make('textarea');copy.className='section-copy';copy.rows=4;copy.value=(s.paragraphs||[]).join('\n\n');copyLabel.append(copy);
 const previews=make('div',null,'section-uploads');
 function draw(){previews.replaceChildren();box.assets.forEach((asset,i)=>{const wrap=make('div'),img=make('img');img.src=asset.src;img.alt=asset.alt;const del=make('button','Remove');del.type='button';del.onclick=()=>{box.assets.splice(i,1);dirty=true;draw()};wrap.append(img,del);previews.append(wrap)})}
 const input=make('input');input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif';input.multiple=true;
 input.onchange=async()=>{for(const f of input.files){try{box.assets.push({src:await upload(f),alt:title.value||'Project design'});dirty=true;draw()}catch(e){status(e.message);break}}input.value=''};
 const remove=make('button','Remove section','remove-section');remove.type='button';remove.onclick=()=>{box.remove();dirty=true};box.append(titleLabel,copyLabel,previews,input,remove);draw();$('#sections').append(box);
}
function preview(){const value=field('image').value;$('#cover-preview').hidden=!value;$('#cover-preview').src=value}
function open(item){
 current=item?structuredClone(item):{id:crypto.randomUUID(),published:false,order:Math.max(-1,...data[kind].map(x=>x.order))+1};form.reset();$('#sections').replaceChildren();status('');
 const project=kind==='projects';$('#edit-title').textContent=(item?'Edit ':'New ')+(project?'project':kind==='hero'?'hero image':'UI shot');
 $('#project-fields').hidden=!project;$('#project-extra').hidden=!project;$('#title-label').hidden=!project;field('name').required=project;$('#hero-layout').hidden=kind!=='hero';$('#image-label').textContent=project?'Project card image':kind==='hero'?'Hero carousel image':'UI shot image';
 ['name','category','cardType','summary','description','role','timeline','liveUrl','caseImage'].forEach(n=>set(n,current[n]));set('image',current.image||current.src);set('alt',current.caseImageAlt||current.alt);set('order',current.order);set('published',String(current.published));set('layout',current.layout||'concept');
 ['headline','intro','tools','projectType'].forEach(n=>set(n,current.caseStudy?.[n]));(current.caseStudy?.sections||[]).forEach(section);preview();dirty=false;editor.showModal();
}
async function upload(file){if(file.size>10*1024*1024)throw Error('Maximum image size is 10 MB.');uploading++;$('#save').disabled=true;status('Uploading image…');try{const formData=new FormData();formData.append('file',file);const r=await api('admin/upload',{method:'POST',body:formData});status('Image uploaded. Save changes to apply it.');return r.url}finally{uploading--;$('#save').disabled=uploading>0}}
[['#cover-upload','image'],['#hero-upload','caseImage']].forEach(([selector,name])=>{$(selector).onchange=async e=>{if(!e.target.files[0])return;try{set(name,await upload(e.target.files[0]));dirty=true;preview()}catch(err){status(err.message)}e.target.value=''}});
$('#add-section').onclick=()=>{section();dirty=true};field('image').onchange=preview;
form.oninput=()=>{dirty=true};
function close(){if(uploading){status('Wait for the upload to finish.');return}if(dirty&&!confirm('Discard unsaved changes?'))return;editor.close();dirty=false}
$('#close').onclick=close;editor.addEventListener('cancel',e=>{e.preventDefault();close()});window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=''}});
form.onsubmit=async e=>{
 e.preventDefault();if(uploading)return;$('#save').disabled=true;status('Saving…');
 const value=n=>field(n).value.trim(),item={...current,order:Number(value('order')),published:value('published')==='true'};
 if(kind==='projects'){
  ['name','category','cardType','summary','description','role','timeline','liveUrl','caseImage','image'].forEach(n=>item[n]=value(n));item.caseImageAlt=value('alt');item.caseStudy={};['headline','intro','tools','projectType'].forEach(n=>item.caseStudy[n]=value(n));item.caseStudy.sections=[...document.querySelectorAll('.case-editor')].map(box=>({title:box.querySelector('.section-title').value,paragraphs:box.querySelector('.section-copy').value.split(/\n\s*\n/).filter(Boolean),images:box.assets}));
 }else{item.src=value('image');item.alt=value('alt');if(kind==='hero')item.layout=value('layout')}
 try{const r=await api('admin/item',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,item,revision:data.revision})});data.revision=r.revision;const i=data[kind].findIndex(x=>x.id===r.item.id);if(i<0)data[kind].push(r.item);else data[kind][i]=r.item;dirty=false;editor.close();render();$('#notice').textContent=item.published?'Published. Refresh the website to see your changes.':'Draft saved. It is only visible in your studio.'}catch(err){status(err.message)}finally{$('#save').disabled=false}
};
document.querySelectorAll('[data-tab]').forEach(tab=>tab.onclick=()=>{kind=tab.dataset.tab;document.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-selected',String(t===tab)));render();$('#notice').textContent=''});$('#add').onclick=()=>open();
(async()=>{try{const session=await api('session');if(!session.admin){$('#login').hidden=false;if(session.signedIn)$('#login>p:nth-of-type(2)').textContent='This account does not have editing access. Sign in with your portfolio owner account.';return}data=await api('admin/content');$('#app').hidden=false;render()}catch(e){$('#login').hidden=false;$('#login>p:nth-of-type(2)').textContent='Unable to open the studio. Please reload and try again.'}finally{$('#loading').hidden=true}})();
