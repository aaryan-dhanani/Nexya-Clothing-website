// Database Web App URL - Replace this with your Google Apps Script URL after deployment
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxtCVLXYBcfsbnHos_SlVfd8DNjQ0vj_8RQGXR-2AtphhFvMOQhqryobdpXlI2NtQVcpA/exec';

// Auth Tabs and Session Management
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is logged in
    const userName = localStorage.getItem('nexyaUserName');
    const navActions = document.querySelector('.nav-actions');

    if (userName && navActions) {
        // Replace "Login / Sign Up" with user's name and logout button
        navActions.innerHTML = `
            <span style="font-weight: 500; display: flex; align-items: center; margin-right: 1rem;">
                Hi, ${userName}
            </span>
            <button id="logoutBtn" class="btn btn-primary" style="background-color: transparent; color: var(--primary); border: 1px solid var(--primary);">Logout</button>
        `;

        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('nexyaUserName');
            window.location.reload();
        });
    }

    // 2. Auth tabs logic
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    if (tabs.length > 0 && forms.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));

                // Add active class to clicked tab and corresponding form
                tab.classList.add('active');
                const targetForm = document.getElementById(tab.dataset.target);
                if (targetForm) {
                    targetForm.classList.add('active');
                }
            });
        });

        // 3. Form Submission Logic
        const signupForm = document.getElementById('signupMenu');
        const loginForm = document.getElementById('loginMenu');

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('signupName').value;
                const emailInput = document.getElementById('signupEmail').value;
                const addressInput = document.getElementById('signupAddress').value;
                const passwordInput = document.getElementById('signupPassword').value;
                
                const submitBtn = signupForm.querySelector('button');
                const originalText = submitBtn.innerText;
                submitBtn.innerText = "Signing up...";
                submitBtn.disabled = true;

                if (SCRIPT_URL.includes('YOUR_GOOGLE')) {
                    // Fallback to local if URL not set
                    localStorage.setItem('nexyaUserName', nameInput);
                    localStorage.setItem('nexyaUserEmail', emailInput);
                    localStorage.setItem('nexyaUserAddress', addressInput);
                    window.location.href = 'index.html';
                    return;
                }

                try {
                    const res = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'signup',
                            name: nameInput,
                            email: emailInput,
                            address: addressInput,
                            password: passwordInput
                        }),
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                    });
                    const result = await res.json();
                    
                    if(result.success) {
                        localStorage.setItem('nexyaUserName', nameInput);
                        localStorage.setItem('nexyaUserEmail', emailInput);
                        localStorage.setItem('nexyaUserAddress', addressInput);
                        alert("Account created successfully!");
                        window.location.href = 'index.html';
                    } else {
                        alert(result.message);
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }
                } catch(e) {
                    alert('Error connecting to database.');
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('loginEmail').value;
                const passwordInput = document.getElementById('loginPassword').value;
                
                const submitBtn = loginForm.querySelector('button');
                const originalText = submitBtn.innerText;
                submitBtn.innerText = "Logging in...";
                submitBtn.disabled = true;

                if (SCRIPT_URL.includes('YOUR_GOOGLE')) {
                    // Fallback to local
                    let nameExtracted = emailInput.split('@')[0];
                    nameExtracted = nameExtracted.charAt(0).toUpperCase() + nameExtracted.slice(1);
                    localStorage.setItem('nexyaUserName', nameExtracted);
                    localStorage.setItem('nexyaUserEmail', emailInput);
                    window.location.href = 'index.html';
                    return;
                }

                try {
                    const res = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'login',
                            email: emailInput,
                            password: passwordInput
                        }),
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                    });
                    const result = await res.json();
                    
                    if(result.success) {
                        localStorage.setItem('nexyaUserName', result.user.name);
                        localStorage.setItem('nexyaUserEmail', result.user.email);
                        if(result.user.address) localStorage.setItem('nexyaUserAddress', result.user.address);
                        window.location.href = 'index.html';
                    } else {
                        alert(result.message);
                        submitBtn.innerText = originalText;
                        submitBtn.disabled = false;
                    }
                } catch(e) {
                    alert('Error connecting to database.');
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    // 4. Set active link in nav
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentPathNoExt = currentPath.replace('.html', '');
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === currentPath || href.replace('.html', '') === currentPathNoExt) {
            link.classList.add('active');
        }
    });

    // 5. Cart Logic
    updateCartCount();

    // Check if on cart page and render cart
    if (document.getElementById('cart-items')) {
        renderCart();
    }

    // Make product cards clickable to view details
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            // Ignore if clicking the add to cart button
            if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) {
                return;
            }
            
            const titleEl = card.querySelector('.product-title');
            const priceEl = card.querySelector('.product-price');
            const imgEl = card.querySelector('img');
            
            const title = titleEl ? titleEl.textContent.trim() : 'Product';
            const priceText = priceEl ? priceEl.textContent.trim() : '₹0.00';
            const img = imgEl ? imgEl.src : '';
            
            window.location.href = `product.html?title=${encodeURIComponent(title)}&price=${encodeURIComponent(priceText)}&img=${encodeURIComponent(img)}`;
        });
    });
});

// Global Cart Functions
function getCart() {
    const cart = localStorage.getItem('nexyaCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('nexyaCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const countElements = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    countElements.forEach(el => {
        el.textContent = totalItems;
    });
}

function addToCart(title, price, img) {
    const cart = getCart();
    const existingItem = cart.find(item => item.title === title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ title, price, img, quantity: 1 });
    }
    
    saveCart(cart);
    alert(`${title} added to cart!`);
}

function removeFromCart(title) {
    let cart = getCart();
    cart = cart.filter(item => item.title !== title);
    saveCart(cart);
    renderCart(); // Re-render if on cart page
}

function updateQuantity(title, newQuantity) {
    let cart = getCart();
    const itemIndex = cart.findIndex(item => item.title === title);
    if (itemIndex > -1) {
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            cart.splice(itemIndex, 1);
        }
        saveCart(cart);
        renderCart();
    }
}

function renderCart() {
    const cartInfo = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const cartTotalEl = document.getElementById('cart-total');
    
    if (!cartInfo || !cartSummary || !emptyMsg || !cartTotalEl) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        cartInfo.innerHTML = '';
        cartSummary.style.display = 'none';
        emptyMsg.style.display = 'block';
        return;
    }
    
    emptyMsg.style.display = 'none';
    cartSummary.style.display = 'block';
    
    let html = '';
    let totalValue = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalValue += itemTotal;
        
        html += `
            <div style="display: flex; align-items: center; padding: 1.5rem; background: var(--bg-white); border-radius: 10px; margin-bottom: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <img src="${item.img}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-right: 1.5rem;">
                <div style="flex-grow: 1;">
                    <h3 style="margin-bottom: 0.5rem;">${item.title}</h3>
                    <p style="color: var(--accent); font-weight: 600;">₹${item.price.toFixed(2)}</p>
                </div>
                <div style="display: flex; align-items: center; margin: 0 1.5rem;">
                    <button style="width: 30px; height: 30px; border: 1px solid var(--border-color); background: none; cursor: pointer; display:flex; align-items:center; justify-content:center;" onclick="updateQuantity('${item.title}', ${item.quantity - 1})">-</button>
                    <span style="width: 40px; text-align: center; font-weight: 500;">${item.quantity}</span>
                    <button style="width: 30px; height: 30px; border: 1px solid var(--border-color); background: none; cursor: pointer; display:flex; align-items:center; justify-content:center;" onclick="updateQuantity('${item.title}', ${item.quantity + 1})">+</button>
                </div>
                <div style="font-weight: 700; min-width: 80px; text-align: right; margin-right: 1.5rem;">
                    ₹${itemTotal.toFixed(2)}
                </div>
                <button style="background: none; border: none; color: #ff4d4d; font-size: 1.2rem; cursor: pointer;" onclick="removeFromCart('${item.title}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    cartInfo.innerHTML = html;
    cartTotalEl.textContent = totalValue.toFixed(2);
}

async function checkout() {
    const userName = localStorage.getItem('nexyaUserName');
    const userEmail = localStorage.getItem('nexyaUserEmail') || "";
    const userAddress = localStorage.getItem('nexyaUserAddress');
    
    if (!userName) {
        alert("Please login or sign up to proceed to checkout.");
        window.location.href = 'auth.html';
        return;
    }
    
    const cart = getCart();
    if(cart.length === 0) return;
    
    let totalValue = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const itemsJson = JSON.stringify(cart.map(i => `${i.quantity}x ${i.title}`));
    
    const checkoutBtn = document.querySelector('button[onclick="checkout()"]');
    const originalText = checkoutBtn ? checkoutBtn.innerText : "Checkout";
    if (checkoutBtn) {
        checkoutBtn.innerText = "Processing...";
        checkoutBtn.disabled = true;
    }

    if (typeof SCRIPT_URL === 'undefined' || SCRIPT_URL.includes('YOUR_GOOGLE')) {
        const addressStr = userAddress ? `\n\nShipping to:\n${userAddress}` : '';
        alert(`Thank you for your order, ${userName}! Your payment will be processed.${addressStr}`);
        localStorage.removeItem('nexyaCart');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'order',
                userName: userName,
                userEmail: userEmail,
                address: userAddress || "Default Address",
                phone: "",
                items: itemsJson,
                total: totalValue
            }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        const result = await res.json();
        if(result.success) {
            alert(`Order confirmed! ${result.message}\nOrder ID: ${result.orderId}`);
            localStorage.removeItem('nexyaCart');
            window.location.href = 'index.html';
        } else {
            alert('Failed to place order: ' + result.message);
            if (checkoutBtn) { checkoutBtn.innerText = originalText; checkoutBtn.disabled = false; }
        }
    } catch(e) {
        alert('Error placing order to database.');
        if (checkoutBtn) { checkoutBtn.innerText = originalText; checkoutBtn.disabled = false; }
    }
}
