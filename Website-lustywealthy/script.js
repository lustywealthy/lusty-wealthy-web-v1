// Configuration & State
const whatsappNumber = "6281903571096";
const ownerPassword = "wealthy26";
let cart = [];

// Filter Produk berdasarkan Kategori
function filterCategory(cat, targetBtn) {
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => {
        btn.classList.remove('bg-[#364F26]', 'text-white');
        btn.classList.add('bg-white', 'text-[#364F26]');
    });

    if (targetBtn) {
        targetBtn.classList.remove('bg-white', 'text-[#364F26]');
        targetBtn.classList.add('bg-[#364F26]', 'text-white');
    }

    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if (cat === 'semua' || card.getAttribute('data-category') === cat) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Buka/Tutup Modal Keranjang
function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('hidden');
}

// Tambah item ke Keranjang
function addToCart(name, price) {
    const index = cart.findIndex(item => item.name === name);
    if (index > -1) {
        cart[index].qty += 1;
    } else {
        cart.push({ name: name, price: price, qty: 1 });
    }
    updateCartUI();

    const cartBadge = document.getElementById('cart-badge');
    const mobileBadge = document.getElementById('mobile-cart-badge');
    if (cartBadge) cartBadge.classList.add('badge-pop');
    if (mobileBadge) mobileBadge.classList.add('badge-pop');
    
    setTimeout(() => {
        if (cartBadge) cartBadge.classList.remove('badge-pop');
        if (mobileBadge) mobileBadge.classList.remove('badge-pop');
    }, 300);
}

// Ubah Jumlah Item (+/-)
function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCartUI();
}

// Update tampilan UI Keranjang
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartBadge = document.getElementById('cart-badge');
    const mobileCartBadge = document.getElementById('mobile-cart-badge');

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-xs text-stone-500 italic text-center py-6">Keranjang belanjaan masih kosong.</p>`;
    } else {
        cartItemsContainer.innerHTML = cart.map((item, i) => {
            totalItems += item.qty;
            totalPrice += item.price * item.qty;
            return `
                <div class="flex justify-between items-center bg-white p-2.5 rounded-xl border border-[#D8D5C9]">
                    <div>
                        <h5 class="text-xs font-bold text-[#364F26]">${item.name}</h5>
                        <p class="text-[11px] text-stone-500">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button onclick="changeQty(${i}, -1)" class="w-5 h-5 bg-[#F3F2EB] text-stone-700 font-bold rounded flex items-center justify-center text-xs">-</button>
                        <span class="text-xs font-bold px-1">${item.qty}</span>
                        <button onclick="changeQty(${i}, 1)" class="w-5 h-5 bg-[#F3F2EB] text-stone-700 font-bold rounded flex items-center justify-center text-xs">+</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    cartTotalElement.innerText = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    if (cartBadge) cartBadge.innerText = totalItems;
    if (mobileCartBadge) mobileCartBadge.innerText = totalItems;
}

// Fitur Checkout via WhatsApp
function checkoutWA() {
    if (cart.length === 0) {
        alert("Keranjang belanja Anda masih kosong!");
        return;
    }

    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const slot = document.getElementById('cust-slot').value;

    if (!name || !phone || !address) {
        alert("Mohon lengkapi Nama, Nomor WhatsApp, dan Alamat Pengiriman.");
        return;
    }

    let text = `Halo Lusty Wealthy, saya mau pesan:\n\n`;
    text += `*Nama:* ${name}\n`;
    text += `*No. WA:* ${phone}\n`;
    text += `*Slot Kirim:* ${slot}\n`;
    text += `*Alamat:* ${address}\n\n`;
    text += `*Rincian Pesanan:*\n`;

    let grandTotal = 0;
    let totalQty = 0;
    let itemsDetail = [];

    cart.forEach((item, index) => {
        const subtotal = item.price * item.qty;
        grandTotal += subtotal;
        totalQty += item.qty;
        itemsDetail.push({ name: item.name, qty: item.qty, price: subtotal });
        text += `${index + 1}. ${item.name} (${item.qty}x) = Rp ${subtotal.toLocaleString('id-ID')}\n`;
    });

    text += `\n*Total Pembayaran:* Rp ${grandTotal.toLocaleString('id-ID')}\n\n`;
    text += `Mohon diproses untuk pengiriman hari ${slot}. Terima kasih!`;

    saveOwnerOrder(name, phone, address, totalQty, grandTotal, slot, itemsDetail);

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
}

// Simpan Data Transaksi ke LocalStorage (Rekap Owner)
function saveOwnerOrder(name, phone, address, qty, total, slot, items) {
    let history = JSON.parse(localStorage.getItem('lw_owner_recap') || '[]');
    history.push({
        id: Date.now(),
        date: new Date().toLocaleString('id-ID'),
        name: name,
        phone: phone,
        address: address,
        qty: qty,
        total: total,
        slot: slot,
        items: items
    });
    localStorage.setItem('lw_owner_recap', JSON.stringify(history));
}

// Authentikasi Owner Login
function loginOwner() {
    const pwd = prompt("Masukkan Password Owner:");
    if (pwd === ownerPassword) {
        openOwnerModal();
    } else if (pwd !== null) {
        alert("Password salah!");
    }
}

// Tampilkan Dashboard Rekap Owner
function openOwnerModal() {
    const history = JSON.parse(localStorage.getItem('lw_owner_recap') || '[]');
    const historyContainer = document.getElementById('owner-history-list');

    let totalQty = 0;
    let totalOmset = 0;

    if (history.length === 0) {
        historyContainer.innerHTML = `<p class="text-stone-400 italic text-center py-4">Belum ada data transaksi tersimpan.</p>`;
    } else {
        historyContainer.innerHTML = history.map(item => {
            totalQty += item.qty;
            totalOmset += item.total;
            const itemsText = item.items ? item.items.map(i => `${i.name} (x${i.qty})`).join(', ') : '-';
            const phoneText = item.phone ? ` • WA: ${item.phone}` : '';
            return `
                <div class="bg-[#F9F8F5] p-3 rounded-lg border border-[#E2DFD2]">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-bold text-[#364F26] text-xs">${item.name} <span class="text-stone-500 font-normal">(${item.slot})</span></p>
                            <p class="text-[10px] text-stone-500">${item.date} • ${item.qty} botol${phoneText}</p>
                        </div>
                        <span class="font-bold text-[#364F26] text-xs">Rp ${item.total.toLocaleString('id-ID')}</span>
                    </div>
                    <p class="text-[10px] text-stone-600 mt-1 italic border-t border-stone-200 pt-1">Item: ${itemsText}</p>
                </div>
            `;
        }).join('');
    }

    document.getElementById('owner-weekly-qty').innerText = `${totalQty} Botol`;
    document.getElementById('owner-weekly-omset').innerText = `Rp ${totalOmset.toLocaleString('id-ID')}`;
    document.getElementById('owner-modal').classList.remove('hidden');
}

// Tutup Modal Owner
function closeOwnerModal() {
    document.getElementById('owner-modal').classList.add('hidden');
}

// Reset Data Rekap Owner
function clearOwnerData() {
    if (confirm("Apakah Anda yakin ingin mengosongkan riwayat rekap penjualan?")) {
        localStorage.removeItem('lw_owner_recap');
        openOwnerModal();
    }
}

// Export Data Rekap ke CSV / Excel
function exportToCSV() {
    const history = JSON.parse(localStorage.getItem('lw_owner_recap') || '[]');
    if (history.length === 0) {
        alert("Belum ada data transaksi untuk diunduh!");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Tanggal,Nama Pemesan,No WA,Slot Kirim,Jumlah (Botol),Total Omset (Rp),Alamat,Rincian Produk\n";

    history.forEach(row => {
        const itemsText = row.items ? row.items.map(i => `${i.name} (${i.qty}x)`).join(' | ') : '-';
        const cleanAddress = `"${row.address.replace(/"/g, '""')}"`;
        const cleanItems = `"${itemsText.replace(/"/g, '""')}"`;
        const phone = row.phone || '-';
        
        csvContent += `"${row.date}","${row.name}","${phone}","${row.slot}",${row.qty},${row.total},${cleanAddress},${cleanItems}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekap_Omset_Lusty_Wealthy_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
