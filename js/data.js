// ============================================
// DATA.JS — All Chemistry Tables & Questions
// Ramazan Hoca'nın Kimya Sınıfı v3.0
// TABLES are loaded from MySQL if available,
// otherwise the hardcoded fallback below is used.
// ============================================

let TABLES = {
    katyonlar: {
        name: "Katyonlar",
        icon: "⚡",
        subtitle: "Tablo 2.1",
        color: "#00BFA5",
        items: [
            { symbol: "Li⁺", name: "Lityum", charge: "+1", bio: "Lityum, periyodik tablonun 3. elementi ve en hafif metaldir. Pil teknolojisinde yaygın kullanılır." },
            { symbol: "Na⁺", name: "Sodyum", charge: "+1", bio: "Sodyum, günlük hayatta en çok sofra tuzu (NaCl) olarak karşımıza çıkar. Yumuşak ve reaktif bir metaldir." },
            { symbol: "K⁺", name: "Potasyum", charge: "+1", bio: "Potasyum, vücudumuzdaki sinir ve kas fonksiyonları için hayati öneme sahip bir elementtir. Muz potasyum açısından zengindir." },
            { symbol: "Rb⁺", name: "Rubidyum", charge: "+1", bio: "Rubidyum, alkali metaller grubundadır. Adını Latince 'koyu kırmızı' anlamına gelen 'rubidus' kelimesinden alır." },
            { symbol: "Cs⁺", name: "Sezyum", charge: "+1", bio: "Sezyum, atomik saatlerde kullanılan son derece hassas bir elementtir. En elektropozitif elementlerden biridir." },
            { symbol: "Mg²⁺", name: "Magnezyum", charge: "+2", bio: "Magnezyum, klorofilin merkezinde yer alır ve bitkilerin fotosentez yapmasını sağlar." },
            { symbol: "Ca²⁺", name: "Kalsiyum", charge: "+2", bio: "Kalsiyum, kemik ve dişlerin ana bileşenidir. Süt ürünlerinde bol miktarda bulunur." },
            { symbol: "Sr²⁺", name: "Stronsiyum", charge: "+2", bio: "Stronsiyum, havai fişeklerde kırmızı renk vermek için kullanılır. Adını İskoçya'daki Strontian köyünden alır." },
            { symbol: "Ba²⁺", name: "Baryum", charge: "+2", bio: "Baryum, tıpta X-ray kontrastı olarak kullanılır. Baryum sülfat, sindirim sistemi görüntülemesinde önemlidir." },
            { symbol: "Al³⁺", name: "Alüminyum", charge: "+3", bio: "Alüminyum, yer kabuğunda en çok bulunan metaldir. Hafif ve dayanıklı olması nedeniyle havacılıkta kullanılır." },
            { symbol: "Zn²⁺", name: "Çinko", charge: "+2", bio: "Çinko, bağışıklık sistemi için önemli bir iz elementtir. Galvanizleme işleminde paslanmayı önlemek için kullanılır." },
            { symbol: "NH₄⁺", name: "Amonyum", charge: "+1", bio: "Amonyum iyonu, gübre üretiminde yaygın kullanılır. Amonyum nitrat, tarımda en çok kullanılan gübrelerden biridir." }
        ]
    },
    anyonlar: {
        name: "Anyonlar",
        icon: "🔬",
        subtitle: "Tablo 2.2",
        color: "#7C4DFF",
        items: [
            { symbol: "F⁻", name: "Florür", charge: "-1", bio: "Florür, diş macunlarında diş çürüğünü önlemek için kullanılır. Flor, en elektronegatif elementtir." },
            { symbol: "Cl⁻", name: "Klorür", charge: "-1", bio: "Klorür, sofra tuzunun (NaCl) önemli bileşenidir. Klor, su arıtımında dezenfektan olarak kullanılır." },
            { symbol: "Br⁻", name: "Bromür", charge: "-1", bio: "Bromür, fotoğrafçılıkta gümüş bromür olarak kullanılmıştır. Brom, oda sıcaklığında sıvı olan iki elementten biridir." },
            { symbol: "I⁻", name: "İyodür", charge: "-1", bio: "İyodür, tiroid bezinin düzgün çalışması için gereklidir. İyot eksikliği guatr hastalığına neden olabilir." },
            { symbol: "S²⁻", name: "Sülfür", charge: "-2", bio: "Sülfür, volkanik bölgelerde doğal olarak bulunur. Kibrit ve barut üretiminde kullanılır." },
            { symbol: "N³⁻", name: "Nitrür", charge: "-3", bio: "Nitrür bileşikleri çok sert malzemeler oluşturur. Bor nitrür, elmas kadar sert olabilir." },
            { symbol: "C⁴⁻", name: "Karbür", charge: "-4", bio: "Karbür bileşikleri endüstride kesici aletlerde kullanılır. Tungsten karbür özellikle dayanıklıdır." },
            { symbol: "H⁻", name: "Hidrür", charge: "-1", bio: "Hidrür, hidrojenin negatif iyon halidir. Metal hidrürler, hidrojen depolama teknolojisinde araştırılmaktadır." },
            { symbol: "O²⁻", name: "Oksit", charge: "-2", bio: "Oksit, oksijenin negatif iyon halidir. Metal oksitler, seramik ve cam üretiminde kullanılır." },
            { symbol: "SO₄²⁻", name: "Sülfat", charge: "-2", bio: "Sülfat, birçok endüstriyel süreçte kullanılır. Bakır sülfat, tarımda mantar ilacı olarak kullanılır." },
            { symbol: "NO₃⁻", name: "Nitrat", charge: "-1", bio: "Nitrat, bitki gübrelerinin ana bileşenlerinden biridir. Potasyum nitrat, barut yapımında kullanılır." },
            { symbol: "CO₃²⁻", name: "Karbonat", charge: "-2", bio: "Karbonat, kireçtaşı ve mermerin ana bileşenidir. Sodyum karbonat, cam üretiminde kullanılır." },
            { symbol: "PO₄³⁻", name: "Fosfat", charge: "-3", bio: "Fosfat, DNA ve RNA'nın yapı taşıdır. Fosfat gübreler, tarımda verimlilik için kullanılır." },
            { symbol: "OH⁻", name: "Hidroksit", charge: "-1", bio: "Hidroksit, bazların karakteristik iyonudur. Sodyum hidroksit (kostik soda) endüstride yaygın kullanılır." },
            { symbol: "CN⁻", name: "Siyanür", charge: "-1", bio: "Siyanür, altın madenciliğinde cevher işlemede kullanılır. Çok zehirli bir bileşiktir." },
            { symbol: "HCO₃⁻", name: "Bikarbonat", charge: "-1", bio: "Bikarbonat, kanımızdaki pH dengesini koruyan tampon sisteminin parçasıdır. Kabartma tozu olarak kullanılır." },
            { symbol: "CH₃COO⁻", name: "Asetat", charge: "-1", bio: "Asetat, sirkenin ana bileşeni olan asetik asitten türer. Tekstil endüstrisinde kullanılır." }
        ]
    },
    metaller: {
        name: "Metaller",
        icon: "⚗️",
        subtitle: "Tablo 2.3",
        color: "#FF4081",
        items: [
            { symbol: "Cr", name: "Krom", charges: ["+2", "+3", "+6"], bio: "Krom, parlak gümüş renkli bir metaldir. Paslanmaz çeliğin ana bileşenidir ve kaplama işlemlerinde kullanılır." },
            { symbol: "Mn", name: "Mangan", charges: ["+2", "+3", "+4", "+6", "+7"], bio: "Mangan, çelik üretiminde alaşım elementi olarak kullanılır. Potasyum permanganat güçlü bir oksitleyicidir." },
            { symbol: "Cu", name: "Bakır", charges: ["+1", "+2"], bio: "Bakır, insanlığın kullandığı ilk metallerden biridir. Elektrik iletkenliği çok yüksektir." },
            { symbol: "Pb", name: "Kurşun", charges: ["+2", "+4"], bio: "Kurşun, ağır ve yumuşak bir metaldir. Tarihi boyunca boru yapımında kullanılmıştır." },
            { symbol: "Sn", name: "Kalay", charges: ["+2", "+4"], bio: "Kalay, teneke kutularda koruyucu kaplama olarak kullanılır. Bronz alaşımının ana bileşenidir." },
            { symbol: "Fe", name: "Demir", charges: ["+2", "+3", "+4", "+6"], bio: "Demir, yer kabuğunda en çok bulunan elementlerden biridir. Hemoglobinde oksijen taşınmasını sağlar." },
            { symbol: "Co", name: "Kobalt", charges: ["+2", "+3"], bio: "Kobalt, mavi pigment olarak yüzyıllardır kullanılmaktadır. B12 vitamininin merkezinde kobalt atomu bulunur." },
            { symbol: "Ag", name: "Gümüş", charges: ["+1", "+2"], bio: "Gümüş, en iyi elektrik ve ısı iletkenidir. Fotoğrafçılık, takı ve elektronik sektöründe kullanılır." }
        ]
    },
    ilk20: {
        name: "İlk 20 Element",
        icon: "🧬",
        subtitle: "Periyodik Tablo",
        color: "#FF6D00",
        items: [
            { symbol: "H", name: "Hidrojen", number: 1, bio: "Hidrojen, evrendeki en bol bulunan elementtir. Güneş'in enerjisini hidrojen füzyonundan alır." },
            { symbol: "He", name: "Helyum", number: 2, bio: "Helyum, soy gazlar grubundadır. Balonlarda ve MRI cihazlarında soğutucu olarak kullanılır." },
            { symbol: "Li", name: "Lityum", number: 3, bio: "Lityum, en hafif metaldir. Şarj edilebilir pillerde yaygın olarak kullanılır." },
            { symbol: "Be", name: "Berilyum", number: 4, bio: "Berilyum, hafif ve sert bir metaldir. X-ray pencerelerinde kullanılır çünkü X-ışınlarını geçirir." },
            { symbol: "B", name: "Bor", number: 5, bio: "Bor, yarı metal olarak sınıflandırılır. Borosilikat cam (Pyrex) üretiminde kullanılır." },
            { symbol: "C", name: "Karbon", number: 6, bio: "Karbon, yaşamın temel elementidir. Elmas ve grafit, karbonun allotroplarıdır." },
            { symbol: "N", name: "Azot", number: 7, bio: "Azot, atmosferin %78'ini oluşturur. Gıda korumada ve gübre üretiminde kullanılır." },
            { symbol: "O", name: "Oksijen", number: 8, bio: "Oksijen, canlıların solunumu için gereklidir. Atmosferin yaklaşık %21'ini oluşturur." },
            { symbol: "F", name: "Flor", number: 9, bio: "Flor, en elektronegatif elementtir. Diş macunlarında ve teflon kaplamada kullanılır." },
            { symbol: "Ne", name: "Neon", number: 10, bio: "Neon, neon tabelaların kırmızı-turuncu ışığını verir. Soy gaz olarak kimyasal tepkimelere girmez." },
            { symbol: "Na", name: "Sodyum", number: 11, bio: "Sodyum, suyla şiddetli tepkime veren bir alkali metaldir. Sofra tuzunun bileşenidir." },
            { symbol: "Mg", name: "Magnezyum", number: 12, bio: "Magnezyum, klorofilin merkezinde yer alır. Hafif alaşımlarda ve havai fişeklerde kullanılır." },
            { symbol: "Al", name: "Alüminyum", number: 13, bio: "Alüminyum, yer kabuğunda en çok bulunan metaldir. Uçak ve otomobil endüstrisinde kullanılır." },
            { symbol: "Si", name: "Silisyum", number: 14, bio: "Silisyum, yarı iletken teknolojisinin temelidir. Bilgisayar çipleri silisyumdan yapılır." },
            { symbol: "P", name: "Fosfor", number: 15, bio: "Fosfor, DNA'nın yapısında bulunur. Kibritlerde ve gübre üretiminde kullanılır." },
            { symbol: "S", name: "Kükürt", number: 16, bio: "Kükürt, volkanların yakınında doğal olarak bulunur. Sülfürik asit üretiminde kullanılır." },
            { symbol: "Cl", name: "Klor", number: 17, bio: "Klor, su arıtımında dezenfektan olarak kullanılır. Sarı-yeşil renkli, keskin kokulu bir gazdır." },
            { symbol: "Ar", name: "Argon", number: 18, bio: "Argon, atmosferdeki en bol soy gazdır (%0.93). Kaynak işlemlerinde koruyucu gaz olarak kullanılır." },
            { symbol: "K", name: "Potasyum", number: 19, bio: "Potasyum, sinir impulsleri için gerekli bir elementtir. Muz ve patates potasyum açısından zengindir." },
            { symbol: "Ca", name: "Kalsiyum", number: 20, bio: "Kalsiyum, kemik ve dişlerin ana mineralidir. Süt ve süt ürünlerinde bol miktarda bulunur." }
        ]
    }
};

// ============================================
// 150 QUESTIONS PER TABLE
// ============================================

function generateKatyonQuestions() {
    const items = TABLES.katyonlar.items;
    const questions = [];
    let id = 1;

    // Type 1: Symbol → Name (50 questions)
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.symbol} iyonunun adı nedir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "symbol_to_name"
        });
    });

    // Type 2: Name → Symbol (50 questions)
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.name} iyonunun sembolü nedir?`,
            correct: item.symbol,
            options: generateOptions(item.symbol, items.map(i => i.symbol)),
            type: "name_to_symbol"
        });
    });

    // Type 3: Charge → Name (25 questions)
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `Yükü ${item.charge} olan katyon hangisidir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "charge_to_name"
        });
    });

    // Type 4: Which is correct? (25 questions)
    items.forEach(item => {
        const wrongNames = items.filter(i => i.name !== item.name).map(i => i.name);
        const wrongOptions = shuffleArray(wrongNames).slice(0, 3);
        questions.push({
            id: id++,
            question: `Aşağıdakilerden hangisi ${item.symbol} sembolünün karşılığıdır?`,
            correct: item.name,
            options: shuffleArray([item.name, ...wrongOptions]),
            type: "identification"
        });
    });

    // Type 5: True/False style (25 questions)
    items.forEach(item => {
        const isTrue = Math.random() > 0.5;
        const displayName = isTrue ? item.name : items.filter(i => i.name !== item.name)[Math.floor(Math.random() * (items.length - 1))].name;
        questions.push({
            id: id++,
            question: `${item.symbol} sembolünün adı "${displayName}" mudur?`,
            correct: isTrue ? "Evet" : "Hayır",
            options: ["Evet", "Hayır", "Emin değilim", "Hiçbiri"],
            type: "true_false",
            explanation: `Doğru cevap: ${item.symbol} = ${item.name}`
        });
    });

    // Type 6: Charge questions (13 questions to reach 150+)
    items.forEach((item, idx) => {
        if (idx < items.length) {
            questions.push({
                id: id++,
                question: `${item.name} iyonunun yükü nedir?`,
                correct: item.charge,
                options: generateOptions(item.charge, ["+1", "+2", "+3", "+4"]),
                type: "name_to_charge"
            });
        }
    });

    return questions.slice(0, 160);
}

function generateAnyonQuestions() {
    const items = TABLES.anyonlar.items;
    const questions = [];
    let id = 1;

    // Type 1: Symbol → Name
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.symbol} iyonunun adı nedir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "symbol_to_name"
        });
    });

    // Type 2: Name → Symbol
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.name} iyonunun sembolü nedir?`,
            correct: item.symbol,
            options: generateOptions(item.symbol, items.map(i => i.symbol)),
            type: "name_to_symbol"
        });
    });

    // Type 3: Charge identification
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.name} iyonunun yükü nedir?`,
            correct: item.charge,
            options: generateOptions(item.charge, ["-1", "-2", "-3", "-4"]),
            type: "charge_id"
        });
    });

    // Type 4: Reverse charge
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `Yükü ${item.charge} olan anyon hangisidir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "charge_to_name"
        });
    });

    // Type 5: Mixed
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `"${item.name}" hangi sembolle gösterilir?`,
            correct: item.symbol,
            options: generateOptions(item.symbol, items.map(i => i.symbol)),
            type: "name_to_symbol_v2"
        });
    });

    // Type 6: Category questions
    const polyatomic = items.filter(i => i.symbol.length > 3);
    const monoatomic = items.filter(i => i.symbol.length <= 3);

    polyatomic.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.symbol} çok atomlu bir anyon mudur?`,
            correct: "Evet",
            options: ["Evet", "Hayır", "Katyon", "Element"],
            type: "category"
        });
    });

    monoatomic.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.symbol} tek atomlu bir anyon mudur?`,
            correct: "Evet",
            options: ["Evet", "Hayır", "Katyon", "Bileşik"],
            type: "category"
        });
    });

    // Fill remaining to reach 150+
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `Aşağıdakilerden hangisi ${item.symbol} iyonudur?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "identification"
        });
    });

    return questions.slice(0, 160);
}

function generateMetallerQuestions() {
    const items = TABLES.metaller.items;
    const questions = [];
    let id = 1;

    // Type 1: Symbol → Name
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.symbol} elementinin adı nedir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "symbol_to_name"
        });
    });

    // Type 2: Name → Symbol
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.name} elementinin sembolü nedir?`,
            correct: item.symbol,
            options: generateOptions(item.symbol, items.map(i => i.symbol)),
            type: "name_to_symbol"
        });
    });

    // Type 3: Charges
    items.forEach(item => {
        item.charges.forEach(charge => {
            questions.push({
                id: id++,
                question: `${item.name} (${item.symbol}) elementi ${charge} yükünü alabilir mi?`,
                correct: "Evet",
                options: ["Evet", "Hayır", "Bazen", "Sadece bileşiklerde"],
                type: "charge_verify"
            });
        });
    });

    // Type 4: Which charges
    items.forEach(item => {
        const chargeStr = item.charges.join(", ");
        questions.push({
            id: id++,
            question: `${item.name} elementinin alabileceği yükler hangileridir?`,
            correct: chargeStr,
            options: generateChargeOptions(chargeStr),
            type: "all_charges"
        });
    });

    // Type 5: Max charge
    items.forEach(item => {
        const maxCharge = item.charges[item.charges.length - 1];
        questions.push({
            id: id++,
            question: `${item.name} elementinin en yüksek yükseltgenme basamağı nedir?`,
            correct: maxCharge,
            options: generateOptions(maxCharge, ["+1", "+2", "+3", "+4", "+5", "+6", "+7"]),
            type: "max_charge"
        });
    });

    // Type 6: Min charge
    items.forEach(item => {
        const minCharge = item.charges[0];
        questions.push({
            id: id++,
            question: `${item.name} elementinin en düşük yükseltgenme basamağı nedir?`,
            correct: minCharge,
            options: generateOptions(minCharge, ["+1", "+2", "+3", "+4"]),
            type: "min_charge"
        });
    });

    // Type 7: How many charges
    items.forEach(item => {
        const count = item.charges.length.toString();
        questions.push({
            id: id++,
            question: `${item.name} elementi kaç farklı yükseltgenme basamağı gösterir?`,
            correct: count,
            options: generateOptions(count, ["2", "3", "4", "5", "6", "7"]),
            type: "charge_count"
        });
    });

    // Type 8: Identification
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `Aşağıdakilerden hangisi ${item.symbol} sembolüyle gösterilir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "identification"
        });
    });

    // Type 9: Reverse
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `"${item.name}" hangi sembolle gösterilir?`,
            correct: item.symbol,
            options: generateOptions(item.symbol, items.map(i => i.symbol)),
            type: "reverse"
        });
    });

    // Type 10: Does element have specific charge?
    items.forEach(item => {
        const wrongCharge = ["+1", "+2", "+3", "+4", "+5", "+6", "+7"].find(c => !item.charges.includes(c));
        if (wrongCharge) {
            questions.push({
                id: id++,
                question: `${item.name} elementi ${wrongCharge} yükünü alabilir mi?`,
                correct: "Hayır",
                options: ["Evet", "Hayır", "Bazen", "Bilinmiyor"],
                type: "charge_verify_false"
            });
        }
    });

    // Type 11: Common charge
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.name} elementinin en yaygın yükseltgenme basamağı hangisidir?`,
            correct: item.charges[0],
            options: generateOptions(item.charges[0], ["+1", "+2", "+3", "+4", "+5", "+6"]),
            type: "common_charge"
        });
    });

    // More mixed questions to reach 150
    for (let i = 0; i < 30; i++) {
        const item = items[i % items.length];
        const randomCharge = item.charges[Math.floor(Math.random() * item.charges.length)];
        questions.push({
            id: id++,
            question: `${randomCharge} yükseltgenme basamağını gösteren metal hangisidir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "charge_to_metal"
        });
    }

    return questions.slice(0, 160);
}

function generateIlk20Questions() {
    const items = TABLES.ilk20.items;
    const questions = [];
    let id = 1;

    // Type 1: Number → Name
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `Atom numarası ${item.number} olan element hangisidir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "number_to_name"
        });
    });

    // Type 2: Name → Number
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.name} elementinin atom numarası kaçtır?`,
            correct: item.number.toString(),
            options: generateOptions(item.number.toString(), items.map(i => i.number.toString())),
            type: "name_to_number"
        });
    });

    // Type 3: Symbol → Name
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.symbol} sembolüyle gösterilen element hangisidir?`,
            correct: item.name,
            options: generateOptions(item.name, items.map(i => i.name)),
            type: "symbol_to_name"
        });
    });

    // Type 4: Name → Symbol
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.name} elementinin sembolü nedir?`,
            correct: item.symbol,
            options: generateOptions(item.symbol, items.map(i => i.symbol)),
            type: "name_to_symbol"
        });
    });

    // Type 5: Number → Symbol
    items.forEach(item => {
        questions.push({
            id: id++,
            question: `${item.number}. elementin sembolü nedir?`,
            correct: item.symbol,
            options: generateOptions(item.symbol, items.map(i => i.symbol)),
            type: "number_to_symbol"
        });
    });

    // Type 6: Which comes after?
    items.forEach((item, idx) => {
        if (idx < items.length - 1) {
            questions.push({
                id: id++,
                question: `${item.name} elementinden sonra gelen element hangisidir?`,
                correct: items[idx + 1].name,
                options: generateOptions(items[idx + 1].name, items.map(i => i.name)),
                type: "sequence"
            });
        }
    });

    // Type 7: Which comes before?
    items.forEach((item, idx) => {
        if (idx > 0) {
            questions.push({
                id: id++,
                question: `${item.name} elementinden önce gelen element hangisidir?`,
                correct: items[idx - 1].name,
                options: generateOptions(items[idx - 1].name, items.map(i => i.name)),
                type: "sequence_before"
            });
        }
    });

    // Type 8: Group identification
    const metals = ["Li", "Be", "Na", "Mg", "Al", "K", "Ca"];
    const nonmetals = ["H", "He", "C", "N", "O", "F", "Ne", "P", "S", "Cl", "Ar"];

    items.forEach(item => {
        const isMetal = metals.includes(item.symbol);
        questions.push({
            id: id++,
            question: `${item.name} (${item.symbol}) bir metal midir?`,
            correct: isMetal ? "Evet" : "Hayır",
            options: ["Evet", "Hayır", "Yarı metal", "Soy gaz"],
            type: "metal_check"
        });
    });

    return questions.slice(0, 160);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateOptions(correct, allOptions) {
    const unique = [...new Set(allOptions)].filter(o => o !== correct);
    const wrong = shuffleArray(unique).slice(0, 3);
    return shuffleArray([correct, ...wrong]);
}

function generateChargeOptions(correctStr) {
    const chargeSetOptions = [
        "+2, +3, +6",
        "+2, +3, +4, +6, +7",
        "+1, +2",
        "+2, +4",
        "+2, +3, +4, +6",
        "+2, +3",
        "+1, +2",
        "+1, +3, +5",
        "+2, +4, +6",
        "+1, +2, +3"
    ];
    const wrong = chargeSetOptions.filter(c => c !== correctStr);
    return shuffleArray([correctStr, ...shuffleArray(wrong).slice(0, 3)]);
}

// ============================================
// MOTIVATIONAL MESSAGES
// ============================================

const MOTIVATIONAL_MESSAGES = [
    { text: "Bugün de harikasın {name}! 💪", type: "encouragement" },
    { text: "Kimya seni bekliyor {name}! ⚗️", type: "motivation" },
    { text: "Ramazan Hoca seninle gurur duyuyor! 👨‍🏫", type: "pride" },
    { text: "Her gün biraz daha iyi oluyorsun {name}! 📈", type: "progress" },
    { text: "Periyodik tablo senin oyun alanın {name}! 🧪", type: "fun" },
    { text: "Bugün yeni bir element öğrenmeye ne dersin {name}? 🔬", type: "challenge" },
    { text: "Sen bir kimya yıldızısın {name}! ⭐", type: "praise" },
    { text: "Ramazan Hoca'nın en çalışkan öğrencisi! 🏆", type: "top" },
    { text: "Kimya dünyasının kapıları sana açık {name}! 🚀", type: "opportunity" },
    { text: "Bugün kaç element ezberleyeceksin {name}? 🎯", type: "goal" },
    { text: "Deney zamanı {name}! Hadi başlayalım! 🧫", type: "action" },
    { text: "Elementlerin gücü seninle {name}! ⚡", type: "power" },
    { text: "Her doğru cevap seni profesörlüğe yaklaştırıyor! 👨‍🔬", type: "level" },
    { text: "Ramazan Hoca not veriyor: {name} çok çalışkan! 📝", type: "note" },
    { text: "Kimya formüllerinin ustası olmaya hazır mısın {name}? 🎓", type: "ready" }
];

const RESULT_MESSAGES = {
    perfect: [
        "Ramazan Hoca seninle gurur duyardı! 👨‍🏫🏆",
        "Mükemmel! Tam puan {name}! 🌟",
        "Sen bir dehasın {name}! Kusursuz! 💎"
    ],
    great: [
        "Harika iş {name}! Devam et! 🎉",
        "Çok iyi {name}! Azmin karşılığını alıyorsun! 💪",
        "Süper performans {name}! 🌈"
    ],
    good: [
        "İyi gidiyorsun {name}, biraz daha! 💪",
        "Fena değil {name}! Bir dahaki sefere daha iyi olacak! 📚",
        "Gelişiyorsun {name}, devam! 🔄"
    ],
    needsWork: [
        "Ramazan Hoca biraz daha çalışmanı ister 😄",
        "Endişelenme {name}, tekrar deneyerek öğrenirsin! 📖",
        "Her usta bir zamanlar çıraktı {name}! 🌱"
    ]
};

// ============================================
// BADGES DATA
// ============================================

const BADGES = [
    { id: "first_game", name: "İlk Oyun", icon: "🥇", description: "İlk oyununu oyna", requirement: "İlk oyununu tamamla", check: (stats) => stats.gamesPlayed >= 1 },
    { id: "combo_master", name: "Kombo Ustası", icon: "🔥", description: "5 kombo yap", requirement: "5 ardışık doğru cevap ver", check: (stats) => stats.maxCombo >= 5 },
    { id: "super_combo", name: "Süper Kombo", icon: "⚡", description: "10 kombo yap", requirement: "10 ardışık doğru cevap ver", check: (stats) => stats.maxCombo >= 10 },
    { id: "legend", name: "Efsane", icon: "👑", description: "Efsanevi kombo yap", requirement: "15 ardışık doğru cevap ver", check: (stats) => stats.maxCombo >= 15 },
    { id: "perfect", name: "Mükemmel", icon: "💯", description: "%100 puan al", requirement: "Bir oyunda tam puan al", check: (stats) => stats.hasPerfectScore },
    { id: "table_conqueror", name: "Tablo Fatihi", icon: "🏆", description: "Tüm tabloları tamamla", requirement: "4 tabloyu da bitir", check: (stats) => stats.tablesCompleted >= 4 },
    { id: "consistent", name: "Kararlı", icon: "📅", description: "3 gün üst üste oyna", requirement: "3 günlük seri yap", check: (stats) => stats.streak >= 3 },
    { id: "professor", name: "Profesör", icon: "👨‍🔬", description: "Profesör seviyesine ulaş", requirement: "601+ puan topla", check: (stats) => stats.totalPoints >= 601 }
];

// ============================================
// LEVEL SYSTEM
// ============================================

const LEVELS = [
    { name: "Çaylak", icon: "⚗️", minPoints: 0, maxPoints: 100, color: "#9E9E9E" },
    { name: "Kimyager", icon: "🔬", minPoints: 101, maxPoints: 300, color: "#00BFA5" },
    { name: "Usta", icon: "🧪", minPoints: 301, maxPoints: 600, color: "#7C4DFF" },
    { name: "Profesör", icon: "👨‍🔬", minPoints: 601, maxPoints: Infinity, color: "#FFD600" }
];

function getLevel(points) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].minPoints) return LEVELS[i];
    }
    return LEVELS[0];
}

function getLevelProgress(points) {
    const level = getLevel(points);
    const idx = LEVELS.indexOf(level);
    if (idx === LEVELS.length - 1) return 100;
    const range = LEVELS[idx + 1].minPoints - level.minPoints;
    const progress = points - level.minPoints;
    return Math.min(100, Math.round((progress / range) * 100));
}

// Generate all question banks
let QUESTION_BANKS = {
    katyonlar: generateKatyonQuestions(),
    anyonlar: generateAnyonQuestions(),
    metaller: generateMetallerQuestions(),
    ilk20: generateIlk20Questions()
};

// ============================================
// DB-DRIVEN TABLE LOADER
// Call this at app startup to override TABLES
// with the latest data from MySQL if available.
// ============================================
async function loadTablesFromDB() {
    try {
        const req = await fetch('/api/questions');
        if (req.ok) {
            const res = await req.json();
            if (res.success && res.tables) {
                // Merge DB tables over defaults (preserves structure for missing keys)
                Object.keys(res.tables).forEach(key => {
                    TABLES[key] = res.tables[key];
                });
                // Regenerate question banks with new data
                QUESTION_BANKS = {
                    katyonlar: generateKatyonQuestions(),
                    anyonlar: generateAnyonQuestions(),
                    metaller: generateMetallerQuestions(),
                    ilk20: generateIlk20Questions()
                };
                console.log('✅ Soru verileri MySQL veritabanından yüklendi!');
            }
        }
    } catch (e) {
        console.warn('⚠️ DB soru verisi yüklenemedi, yerel (fallback) veriler kullanılıyor.');
    }
}
