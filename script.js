/* ---------------- TYPED NAME (looping) ---------------- */
const typedEl = document.getElementById('typed-name');
const NAME = 'SULFIKAR';
let pos = 0;
let forward = true;

function loopType(){
  if(forward){
    typedEl.textContent = NAME.slice(0, pos + 1);
    pos++;
    if(pos >= NAME.length){
      forward = false;
      setTimeout(loopType, 900);
      return;
    }
  } else {
    typedEl.textContent = NAME.slice(0, pos - 1);
    pos--;
    if(pos <= 0){
      forward = true;
      setTimeout(loopType, 300);
      return;
    }
  }
  setTimeout(loopType, 140);
}
loopType();

/* ---------------- SMOOTH SCROLL + NAV FX ---------------- */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    const target = document.querySelector(href);
    if(target){
      // small click animation
      link.style.transform = 'translateY(-4px) scale(1.03)';
      setTimeout(()=> link.style.transform = '', 220);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---------------- IntersectionObserver for reveal & skill anim ---------------- */
const ioOptions = { root: null, rootMargin: '0px', threshold: 0.18 };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible'); // adds fade-in.visible via CSS
      // animate skill-fill inside observed element
      entry.target.querySelectorAll && entry.target.querySelectorAll('.skill-fill').forEach(sf => {
        const w = sf.getAttribute('data-fill') || sf.dataset.fill || '0%';
        setTimeout(()=> { sf.style.width = w; }, 120);
      });
    }
  });
}, ioOptions);

document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
document.querySelectorAll('.skill-item').forEach(el => io.observe(el));

/* ---------------- MOBILE NAV TOGGLE ---------------- */
const navToggle = document.getElementById('nav-toggle');
const navList = document.querySelector('.nav-list');
if(navToggle && navList){
  navToggle.addEventListener('click', () => {
    const open = navList.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // basic accessible focus management
    if(open) navList.querySelector('a')?.focus();
  });
  // close on link click (mobile)
  navList.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', () => {
      if(window.innerWidth <= 900 && navList.classList.contains('nav-open')){
        navList.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded','false');
      }
    });
  });
}

/* ---------------- SOCIAL ICON PRESS ANIMATION ---------------- */
document.querySelectorAll('.social').forEach(el => {
  // mousedown for desktop, touchstart for mobile
  el.addEventListener('mousedown', () => el.style.transform = 'scale(.92)');
  el.addEventListener('mouseup',   () => el.style.transform = '');
  el.addEventListener('mouseleave',() => el.style.transform = '');
  el.addEventListener('touchstart',()=> el.style.transform = 'scale(.92)', {passive:true});
  el.addEventListener('touchend',  ()=> el.style.transform = '');
});

/* ---------------- UPLOAD + GALLERY (localStorage) ---------------- */
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const gallery = document.getElementById('gallery');
const STORAGE_KEY = 'sulfikar_gallery_v1';

// load existing items from localStorage (array of {id, type, dataURL, name})
let items = [];
try{
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw) items = JSON.parse(raw);
} catch(e){
  console.warn('Cannot read gallery from localStorage', e);
}
renderGallery();

// helper to save items to localStorage
function saveItems(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch(e){
    alert('Gagal menyimpan ke localStorage (mungkin ukuran file terlalu besar). Hapus beberapa file lalu coba lagi.');
    console.error(e);
  }
}

// read files and add to gallery
function handleFiles(fileList){
  const arr = Array.from(fileList).slice(0, 12); // limit per upload for safety
  arr.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      // create item and push
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      items.unshift({ id, type, data: ev.target.result, name: file.name });
      saveItems();
      renderGallery();
    };
    // read as dataURL (image/video)
    reader.readAsDataURL(file);
  });
}

/* UI events */
fileInput.addEventListener('change', (e) => {
  if(e.target.files.length) handleFiles(e.target.files);
  fileInput.value = '';
});

// drag & drop
['dragenter','dragover'].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    dropZone.classList.add('dragover');
  });
});
['dragleave','drop','dragend'].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault(); e.stopPropagation();
    dropZone.classList.remove('dragover');
  });
});
dropZone.addEventListener('drop', (e) => {
  if(e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
});

/* render gallery */
function renderGallery(){
  gallery.innerHTML = '';
  if(items.length === 0){
    gallery.innerHTML = '<p style="opacity:.8">Belum ada hasil kerja. Upload gambar atau video supaya tampil di sini.</p>';
    return;
  }
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'gallery-card fade-in';
    card.setAttribute('data-id', item.id);

    // media element
    if(item.type === 'video'){
      const vid = document.createElement('video');
      vid.src = item.data;
      vid.controls = true;
      card.appendChild(vid);
    } else {
      const img = document.createElement('img');
      img.src = item.data;
      img.alt = item.name || 'Hasil kerja';
      card.appendChild(img);
    }

    // overlay actions
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    // view button (open in new tab)
    const viewBtn = document.createElement('button');
    viewBtn.className = 'icon-btn';
    viewBtn.title = 'Buka di tab baru';
    viewBtn.innerHTML = '<i class="bx bx-expand"></i>';
    viewBtn.addEventListener('click', () => {
      const w = window.open();
      w.document.write(`<title>${item.name || ''}</title>`);
      if(item.type === 'video') w.document.write(`<video src="${item.data}" controls autoplay style="width:100%;height:100%;object-fit:contain"></video>`);
      else w.document.write(`<img src="${item.data}" style="width:100%;height:100%;object-fit:contain" alt="">`);
    });

    // delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.title = 'Hapus';
    delBtn.innerHTML = '<i class="bx bx-trash"></i>';
    delBtn.addEventListener('click', () => {
      if(confirm('Hapus item ini dari gallery?')) {
        items = items.filter(it => it.id !== item.id);
        saveItems();
        renderGallery();
      }
    });

    actions.appendChild(viewBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);

    // overlay for hover effect
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    card.appendChild(overlay);

    gallery.appendChild(card);
    // observe for reveal animation
    io.observe(card);
  });
}

/* ---------------- Accessibility & safety note ---------------- */
// localStorage is used to persist previews locally only on this browser.
// If you want server-hosted uploads (publicly accessible), you'll need a backend or hosting service.
// For now this client-only approach lets kamu upload & show karya langsung di website.
