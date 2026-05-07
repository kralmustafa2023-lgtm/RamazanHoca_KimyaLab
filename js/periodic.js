// ============================================
// PERIODIC.JS — Interaktif Periyodik Tablo
// Ramazan Hoca'nın Kimya Sınıfı
// ============================================

const PERIODIC = (() => {

    // Renk kategorileri
    const CAT_COLORS = {
        'alkali':     { bg: '#FF6B6B', text: '#fff', label: 'Alkali Metal' },
        'alkaline':   { bg: '#FFA94D', text: '#fff', label: 'Toprak Alkali' },
        'transition': { bg: '#74C0FC', text: '#1a1a1a', label: 'Geçiş Metali' },
        'other':      { bg: '#A9E34B', text: '#1a1a1a', label: 'Diğer Metal' },
        'metalloid':  { bg: '#63E6BE', text: '#1a1a1a', label: 'Yarı Metal' },
        'nonmetal':   { bg: '#E599F7', text: '#1a1a1a', label: 'Ametal' },
        'noble':      { bg: '#4DABF7', text: '#fff', label: 'Soy Gaz' },
        'halogen':    { bg: '#F783AC', text: '#fff', label: 'Halojen' },
        'lanthanide': { bg: '#FAB005', text: '#1a1a1a', label: 'Lantanit' },
        'actinide':   { bg: '#FF922B', text: '#fff', label: 'Aktinik' }
    };

    // İlk 20 element + seçili geçiş metalleri
    const ELEMENTS = [
        { n:1,  s:'H',  name:'Hidrojen',   cat:'nonmetal',  grp:1,  per:1, mass:'1.008',   ec:'1',          bio:'Evrenin en bol elementi. Güneş enerjisinin kaynağı.' },
        { n:2,  s:'He', name:'Helyum',      cat:'noble',     grp:18, per:1, mass:'4.003',   ec:'2',          bio:'Soy gaz. Balonlarda ve MRI soğutucularında kullanılır.' },
        { n:3,  s:'Li', name:'Lityum',      cat:'alkali',    grp:1,  per:2, mass:'6.941',   ec:'2,1',        bio:'En hafif metal. Şarj edilebilir pillerde kullanılır.' },
        { n:4,  s:'Be', name:'Berilyum',    cat:'alkaline',  grp:2,  per:2, mass:'9.012',   ec:'2,2',        bio:'Hafif ve sert metal. X-ışını pencerelerinde kullanılır.' },
        { n:5,  s:'B',  name:'Bor',         cat:'metalloid', grp:13, per:2, mass:'10.811',  ec:'2,3',        bio:'Yarı metal. Borosilikat cam üretiminde kullanılır.' },
        { n:6,  s:'C',  name:'Karbon',      cat:'nonmetal',  grp:14, per:2, mass:'12.011',  ec:'2,4',        bio:'Yaşamın temeli. Elmas ve grafit karbonun allotroplarıdır.' },
        { n:7,  s:'N',  name:'Azot',        cat:'nonmetal',  grp:15, per:2, mass:'14.007',  ec:'2,5',        bio:'Atmosferin %78\'ini oluşturur. Gübre üretiminde kritik.' },
        { n:8,  s:'O',  name:'Oksijen',     cat:'nonmetal',  grp:16, per:2, mass:'15.999',  ec:'2,6',        bio:'Solunum için zorunlu. Atmosferin %21\'ini oluşturur.' },
        { n:9,  s:'F',  name:'Flor',        cat:'halogen',   grp:17, per:2, mass:'18.998',  ec:'2,7',        bio:'En elektronegatif element. Diş macununda kullanılır.' },
        { n:10, s:'Ne', name:'Neon',        cat:'noble',     grp:18, per:2, mass:'20.180',  ec:'2,8',        bio:'Soy gaz. Neon tabelaların kırmızı ışığını verir.' },
        { n:11, s:'Na', name:'Sodyum',      cat:'alkali',    grp:1,  per:3, mass:'22.990',  ec:'2,8,1',      bio:'Suyla şiddetli tepkir. Sofra tuzunun (NaCl) bileşeni.' },
        { n:12, s:'Mg', name:'Magnezyum',   cat:'alkaline',  grp:2,  per:3, mass:'24.305',  ec:'2,8,2',      bio:'Klorofilin merkezi. Fotosentez için gereklidir.' },
        { n:13, s:'Al', name:'Alüminyum',   cat:'other',     grp:13, per:3, mass:'26.982',  ec:'2,8,3',      bio:'Yer kabuğunda en bol metal. Havacılıkta kullanılır.' },
        { n:14, s:'Si', name:'Silisyum',    cat:'metalloid', grp:14, per:3, mass:'28.086',  ec:'2,8,4',      bio:'Yarı iletken teknolojisinin temeli. Bilgisayar çipleri.' },
        { n:15, s:'P',  name:'Fosfor',      cat:'nonmetal',  grp:15, per:3, mass:'30.974',  ec:'2,8,5',      bio:'DNA yapısında bulunur. Kibrit ve gübre üretiminde.' },
        { n:16, s:'S',  name:'Kükürt',      cat:'nonmetal',  grp:16, per:3, mass:'32.065',  ec:'2,8,6',      bio:'Volkanik bölgelerde doğal halde bulunur.' },
        { n:17, s:'Cl', name:'Klor',        cat:'halogen',   grp:17, per:3, mass:'35.453',  ec:'2,8,7',      bio:'Su arıtımında dezenfektan. Sarı-yeşil keskin gazı.' },
        { n:18, s:'Ar', name:'Argon',       cat:'noble',     grp:18, per:3, mass:'39.948',  ec:'2,8,8',      bio:'Atmosferin en bol soy gazı (%0.93). Kaynak gazı.' },
        { n:19, s:'K',  name:'Potasyum',    cat:'alkali',    grp:1,  per:4, mass:'39.098',  ec:'2,8,8,1',    bio:'Sinir impulsleri için gerekli. Muz ve patateste bol.' },
        { n:20, s:'Ca', name:'Kalsiyum',    cat:'alkaline',  grp:2,  per:4, mass:'40.078',  ec:'2,8,8,2',    bio:'Kemik ve dişlerin ana minerali. Sütte bol miktarda.' },
        { n:24, s:'Cr', name:'Krom',        cat:'transition',grp:6,  per:4, mass:'51.996',  ec:'2,8,13,1',   bio:'Paslanmaz çeliğin ana bileşeni. Parlak gümüş renkli.' },
        { n:25, s:'Mn', name:'Mangan',      cat:'transition',grp:7,  per:4, mass:'54.938',  ec:'2,8,13,2',   bio:'Çelik üretiminde alaşım elementi. +2 ile +7 yük alır.' },
        { n:26, s:'Fe', name:'Demir',       cat:'transition',grp:8,  per:4, mass:'55.845',  ec:'2,8,14,2',   bio:'Hemoglobinde oksijen taşır. Yer kabuğunun %5\'i.' },
        { n:27, s:'Co', name:'Kobalt',      cat:'transition',grp:9,  per:4, mass:'58.933',  ec:'2,8,15,2',   bio:'Mavi pigment. B12 vitamininin merkezinde kobalt var.' },
        { n:29, s:'Cu', name:'Bakır',       cat:'transition',grp:11, per:4, mass:'63.546',  ec:'2,8,18,1',   bio:'İlk kullanılan metallerden. Yüksek elektrik iletkenliği.' },
        { n:30, s:'Zn', name:'Çinko',       cat:'transition',grp:12, per:4, mass:'65.380',  ec:'2,8,18,2',   bio:'Bağışıklık için önemli. Galvanizlemede paslanmayı önler.' },
        { n:47, s:'Ag', name:'Gümüş',       cat:'transition',grp:11, per:5, mass:'107.868', ec:'2,8,18,18,1',bio:'En iyi elektrik iletkeni. Takı ve elektronik sektöründe.' },
        { n:82, s:'Pb', name:'Kurşun',      cat:'other',     grp:14, per:6, mass:'207.200', ec:'2,8,18,32,18,4',bio:'Ağır ve yumuşak metal. Tarihi boyunca boru yapımında.' },
        { n:50, s:'Sn', name:'Kalay',       cat:'other',     grp:14, per:5, mass:'118.710', ec:'2,8,18,18,4',bio:'Teneke kutularda koruyucu kaplama. Bronzun bileşeni.' }
    ];

    let currentFilter = 'all';
    let searchQuery = '';

    function getFilteredElements() {
        return ELEMENTS.filter(el => {
            const matchCat = currentFilter === 'all' || el.cat === currentFilter;
            const q = searchQuery.toLowerCase();
            const matchSearch = !q || el.name.toLowerCase().includes(q) || el.s.toLowerCase().includes(q) || String(el.n).includes(q);
            return matchCat && matchSearch;
        });
    }

    function render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = buildHTML();
        attachEvents(container);

        const cards = container.querySelectorAll('.pt-card');
        if (typeof Animations !== 'undefined') Animations.staggeredEntrance(Array.from(cards), 20);
    }

    function buildHTML() {
        const catEntries = Object.entries(CAT_COLORS);

        const legendHTML = catEntries.map(([k, v]) =>
            `<div class="pt-legend-item" onclick="PERIODIC.setFilter('${k}')" style="background:${v.bg};color:${v.text}">${v.label}</div>`
        ).join('');

        const filtered = getFilteredElements();

        const cardsHTML = filtered.map(el => {
            const c = CAT_COLORS[el.cat] || CAT_COLORS['other'];
            const dim = (currentFilter !== 'all' && el.cat !== currentFilter) ? 'opacity:0.25;' : '';
            return `
            <div class="pt-card" onclick="PERIODIC.showDetail(${el.n})"
                 style="background:${c.bg};color:${c.text};${dim}"
                 title="${el.name}">
                <div class="pt-num">${el.n}</div>
                <div class="pt-sym">${el.s}</div>
                <div class="pt-name">${el.name}</div>
                <div class="pt-mass">${el.mass}</div>
            </div>`;
        }).join('');

        return `
        <div class="pt-screen">
            <div class="pt-header">
                <div class="pt-header-inner">
                    <h2>⚛️ İnteraktif Periyodik Tablo</h2>
                    <p>Elemente tıklayarak detaylarını gör</p>
                </div>
                <div class="pt-search-wrap">
                    <input class="pt-search" id="pt-search-input" type="text"
                           placeholder="🔍 Element ara... (isim, sembol, numara)"
                           oninput="PERIODIC.onSearch(this.value)">
                </div>
            </div>

            <div class="pt-legend">
                <div class="pt-legend-item ${currentFilter==='all'?'pt-legend-active':''}"
                     onclick="PERIODIC.setFilter('all')"
                     style="background:var(--bg-card);color:var(--text-primary);border:2px solid var(--teal)">
                    🔬 Tümü
                </div>
                ${legendHTML}
            </div>

            <div class="pt-grid">
                ${cardsHTML}
            </div>

            <div class="pt-footer">
                <span>Toplam <b>${filtered.length}</b> element gösteriliyor</span>
            </div>
        </div>`;
    }

    function attachEvents(container) {
        const input = container.querySelector('#pt-search-input');
        if (input) input.value = searchQuery;
    }

    function onSearch(val) {
        searchQuery = val;
        const container = document.getElementById('pt-root');
        if (container) {
            container.innerHTML = buildHTML();
            attachEvents(container);
        }
    }

    function setFilter(cat) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        currentFilter = cat;
        const container = document.getElementById('pt-root');
        if (container) {
            container.innerHTML = buildHTML();
            attachEvents(container);
            const cards = container.querySelectorAll('.pt-card');
            if (typeof Animations !== 'undefined') Animations.staggeredEntrance(Array.from(cards), 15);
        }
    }

    function showDetail(atomNum) {
        if (typeof AUDIO !== 'undefined') AUDIO.playClick();
        const el = ELEMENTS.find(e => e.n === atomNum);
        if (!el) return;

        const c = CAT_COLORS[el.cat] || CAT_COLORS['other'];
        const existing = document.getElementById('pt-detail-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'pt-detail-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(14px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;transition:opacity 0.3s;';
        overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

        overlay.innerHTML = `
        <div class="pt-detail-card" style="background:var(--bg-card);border-radius:28px;width:100%;max-width:400px;overflow:hidden;transform:scale(0.85) translateY(30px);transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 0 60px ${c.bg}55,0 30px 80px rgba(0,0,0,0.7);">
            <div style="background:linear-gradient(135deg,${c.bg},${c.bg}99);padding:35px 25px 25px;text-align:center;position:relative;">
                <button onclick="document.getElementById('pt-detail-overlay').remove()"
                        style="position:absolute;top:14px;right:14px;background:rgba(0,0,0,0.2);border:none;color:${c.text};font-size:20px;width:34px;height:34px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
                <div style="font-size:11px;font-weight:800;color:${c.text};opacity:0.8;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">
                    Atom No: ${el.n} &nbsp;·&nbsp; ${c.label}
                </div>
                <div style="font-size:90px;font-weight:900;color:${c.text};line-height:1;text-shadow:0 8px 25px rgba(0,0,0,0.2);">${el.s}</div>
                <div style="font-size:28px;font-weight:800;color:${c.text};margin-top:8px;">${el.name}</div>
            </div>
            <div style="padding:22px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                    <div style="background:var(--bg-secondary);border-radius:14px;padding:14px;border-left:4px solid ${c.bg};">
                        <div style="font-size:10px;color:var(--text-muted);font-weight:800;text-transform:uppercase;letter-spacing:1px;">Atom Kütlesi</div>
                        <div style="font-size:18px;font-weight:800;color:var(--text-primary);margin-top:3px;">${el.mass}</div>
                    </div>
                    <div style="background:var(--bg-secondary);border-radius:14px;padding:14px;border-left:4px solid ${c.bg};">
                        <div style="font-size:10px;color:var(--text-muted);font-weight:800;text-transform:uppercase;letter-spacing:1px;">Elektron Dizilimi</div>
                        <div style="font-size:18px;font-weight:800;color:var(--text-primary);margin-top:3px;">${el.ec}</div>
                    </div>
                </div>
                <div style="background:var(--bg-secondary);border-radius:14px;padding:16px;margin-bottom:16px;border-left:4px solid ${c.bg};position:relative;">
                    <div style="position:absolute;top:-10px;left:16px;background:${c.bg};color:${c.text};padding:2px 10px;border-radius:6px;font-size:10px;font-weight:800;">Ramazan Hoca Notu 📝</div>
                    <p style="font-size:14px;color:var(--text-primary);line-height:1.6;margin:0;">${el.bio}</p>
                </div>
                <div style="display:flex;gap:10px;">
                    <button onclick="APP.speak('${el.name}. ${el.bio.replace(/'/g,'')}'); this.innerHTML='⏸ Okunuyor...';"
                            style="flex:1;padding:13px;border-radius:14px;background:${c.bg};color:${c.text};border:none;font-weight:800;font-size:14px;cursor:pointer;">
                        🔊 Sesli Dinle
                    </button>
                    <button onclick="document.getElementById('pt-detail-overlay').remove()"
                            style="padding:13px 18px;border-radius:14px;background:var(--bg-secondary);color:var(--text-muted);border:none;font-weight:700;cursor:pointer;">
                        Kapat
                    </button>
                </div>
            </div>
        </div>`;

        document.body.appendChild(overlay);
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('.pt-detail-card').style.transform = 'scale(1) translateY(0)';
        }, 10);
    }

    return { render, onSearch, setFilter, showDetail };
})();
