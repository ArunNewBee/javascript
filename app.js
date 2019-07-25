const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "v9stcc2kg2vc",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "7pQHbrbSaAifX8Y-kAuV6woAdhQEWxTBtyERzSjEiig"
  });

// variables

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-btn');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the products
class Products {
async getProducts(){
    try{
        let contentful = await client.getEntries({
            content_type: 'comfyHouseProducts'
        });
        console.log(contentful);
       //let result = await fetch('products.json');
       //let data = await result.json();
       let products = contentful.items;
       products = products.map(items =>{
           const {name, price} = items.fields;
           const {id} = items.sys;
           const image = items.fields.image.fields.file.url;
           return {name, price, id, image};
       })
       return products;
    }
    catch(error){
        console,log(error);
    }
}
}

//display products
class UI {
    displayProducts(products) {
        let result ='';
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src=${product.image} class="product-img" />
                <button class="bag-btn" data-id=${product.id}>
                    <i class="fas fa-shopping-cart"></i> Add to cart</button>
            </div>
            <h3>${product.name}</h3>
            <h4>$${product.price}</h4>
        </article>
            `
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart) {
                button.innerText = "In Cart";
                button.disabled = true;   
            }
            button.addEventListener("click", event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;

                // get product from products
                let cartItem = {...Storage.getProduct(id), amount:1};
                
                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in localStorage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValue(cart);
                // display cart items
                this.addCartItem(cartItem);
                // show the cart
                this.showCart();
            })
        })
    }
    setCartValue(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartItems.innerText = itemsTotal;
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    }
    addCartItem(item) {
        let div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} alt="">
                    <div>
                        <h4>${item.name}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                            <i class="fas fa-chevron-up" data-id=${item.id}></i>
                            <div class="item-amount">${item.amount}</div>
                            <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        `
        cartContent.appendChild(div);
    }
    showCart() {
        cartDOM.classList.add('showCart');
        cartOverlay.classList.add('transparentBcg');
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValue(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        cartContent.addEventListener('click', event => {
            if(event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.remove(id);
            }
            else if(event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValue(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if(tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValue(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.remove(id);
                }
                
            }
        })
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    
    clearCart() {
        let CartItems = cart.map(item => item.id);
        CartItems.forEach(id => this.remove(id));
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    remove(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValue(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

//local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[];
    }
}

document.addEventListener("DOMContentLoaded",() => {
const ui = new UI();
const products = new Products();

ui.setupAPP();

products.getProducts().then(products => {
    ui.displayProducts(products);
    Storage.saveProducts(products);
}).then(() => ui.getBagButtons());

})