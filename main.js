
const cartBtn = document.querySelector(".header-cart");
const cart = document.querySelector(".cart");
const closeCart = document.querySelector(".cart-close");

const productsContent = document.querySelector(".products-content");

const cartCount = document.querySelector(".header-cart-count");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content-ex-fotter");
const cartClearBtn = document.querySelector(".cart-clear-btn");


const topBtn = document.querySelector(".top-btn");


let cartStorage = [];
let buttonsDom = [];

class Products {
  getProducts = async () => {
      try {
          let res = await fetch("products.json");
          let data = await res.json();
          let products = data.items;
          products = products.map(product => {
              const {id} = product.sys;
              const {title, price, image} = product.fields;
              return { id, title, price, image}
          })
          return products
          
      } catch (error) {
          console.log(error)
      }
  }
};

class Ui {
    displayProducts = (products) => {
        let result = "";
        products.map(product => {
          result +=  `
          <div class="product">
                  <div class="product-img-box">
                      <img class="product-img" src=${product.image} />
                      <button class="product-add-btn" data-id=${product.id}>
                          <i class="fas fa-shopping-cart"></i>
                      </button>
                  </div>
                  <h3 class="product-ttl">${product.title}</h3>
                  <h4 class="product-price">$ <span>${product.price}</span></h4>
              </div>
          `
        });
        productsContent.innerHTML = result;
    };

    getAddBtns = () => {
        const addBtns = [...document.querySelectorAll(".product-add-btn")];
        buttonsDom = addBtns;
       addBtns.forEach(addBtn => {
           let id = addBtn.dataset.id;
           let inCartStorage = cartStorage.find(product => product.id === id);
           if (inCartStorage) {
               addBtn.innerHTML = "In Cart";
               addBtn.disabled = true
           }
           // add to cart
           addBtn.addEventListener("click", (e) => {
               e.currentTarget.innerHTML = "In Cart";
               e.currentTarget.disabled = true;
               
               //get product from products
               let cartItem = {...Storage.getProduct(id), amount: 1};

               //add product to the cart
               cartStorage = [...cartStorage, cartItem];

               //save cart in local storage
               Storage.saveCart(cartStorage);

               //set cart values
               this.setCartValues(cartStorage)

               //display cart item
               this.addCartItem(cartItem)

               //show the cart
               this.showCart();
           });
       })
    };

    setCartValues(cartStorage) {
        let tempTotal = 0;
        let tempCount = 0;
        cartStorage.map(item => {
            tempTotal += item.price * item.amount;
            tempCount += item.amount
        })
        cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
        cartCount.innerHTML = tempCount;
      };

      addCartItem(cartItem) {
        const div = document.createElement("div");
          div.classList.add("cart-item")
          div.innerHTML = `
              <div class="cart-item-img-box">
                  <img class="cart-item-img" src=${cartItem.image} alt="item">
              </div>
              <div class="cart-item-info">
                <h4 class="cart-item-ttl">${cartItem.title}</h4>
                  <h4 class="cart-item-price">$${cartItem.price}</h4>
                  <h4 class="cart-item-remove" data-id=${cartItem.id}>Remove</h4>
              </div>
              <div class="cart-item-inc-dec">
                <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
                <span class="cart-item-num">1</span>
                <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
              </div>
            `
            cartContent.appendChild(div)
      };

      showCart() {
        cart.classList.add("show-cart");
      };

      hideCart() {
        cart.classList.remove("show-cart")
      }

      setAPP() {
          cartStorage = Storage.getCart();
          this.setCartValues(cartStorage);
          this.populateCart(cartStorage);
          cartBtn.addEventListener("click", this.showCart);
          closeCart.addEventListener("click", this.hideCart)
      };

      populateCart(cartStorage) {
          cartStorage.forEach(cartItem => this.addCartItem(cartItem));
      }

      // clear cart
      cartLogic() {
          cartClearBtn.addEventListener("click", () => {
              this.clearCart();
          });

          cartContent.addEventListener("click", (e) => {
              if (e.target.classList.contains("cart-item-remove")) {
                  let removeItem = e.target.dataset.id;
                  this.removeItem(removeItem);
                  cartContent.removeChild(e.target.parentElement.parentElement);
              } else if (e.target.classList.contains("fa-chevron-up")) {
                  let id = e.target.dataset.id;
                  let tempItem = cartStorage.find(item => item.id === id);
                  tempItem.amount = tempItem.amount + 1;
                  this.setCartValues(cartStorage);
                  Storage.saveCart(cartStorage);
                  e.target.nextElementSibling.innerHTML = tempItem.amount
              } else if(e.target.classList.contains("fa-chevron-down")) {
                let id = e.target.dataset.id;
                let tempItem = cartStorage.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    this.setCartValues(cartStorage);
                    Storage.saveCart(cartStorage);
                    e.target.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(e.target.parentElement.parentElement);
                    this.removeItem(id)
                }
              }
          })

      };

      clearCart() {
        let cartItems = cartStorage.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
      }

      removeItem(id) {
        cartStorage = cartStorage.filter(item => item.id !== id);
        this.setCartValues(cartStorage);
        Storage.saveCart(cartStorage);
        let button = this.findButton(id);
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>`
        button.disabled = false
      };

      findButton(id) {
        return buttonsDom.find(button => button.dataset.id === id);
      }
      


};

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    };
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id) ;
    };
    static saveCart(cartStorage) {
        localStorage.setItem("cart", JSON.stringify(cartStorage))
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const ui = new Ui();
    const products = new Products();
    
    ui.setAPP();
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    })
    .then(() => {
         ui.getAddBtns();
         ui.cartLogic();
    });    
});




/* toggle cart */
cartBtn.addEventListener("click", () => {
    cart.classList.add("show-cart");
    if (cart.classList.contains("show-cart")) {
        document.body.classList.add("sub-body")
    }
});

closeCart.addEventListener("click", () => {
    cart.classList.remove("show-cart");
    if (!cart.classList.contains("show-cart")) {
        document.body.classList.remove("sub-body")
    }
});



/* show top btn */
window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300 ) {
        topBtn.classList.add("show-btn");
    } else {
        topBtn.classList.remove("show-btn");
    }
});

topBtn.addEventListener("click", () => {
    window.scrollTo(0, 0)
})
