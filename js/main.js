$(".slider").slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  dots: false,
});


const seller_list = document.querySelector(".seller_list");
const seller = document.querySelector(".seller_sub_list");
const cart_list = document.querySelector(".cart_list")
const cart_total_price = document.querySelector(".cart_total_price")
const cart_items_total = document.querySelector(".cart_items_total")
const cart_total_item = document.querySelector(".cart_total_item")
const header_korzinka_btn = document.querySelector(".header_korzinka_btn")
const cart_block = document.querySelector(".cart_block")
const close = document.querySelector(".close")
const btn = document.getElementsByClassName("seller_btn")

import { getData, getItem, getLocal } from "./service.js";

const saveInfo = (item) => {
  const oldData = JSON.parse(localStorage.getItem("data")) || [];
  const data = oldData.some(existingItem => existingItem.id === item.id);

  if (!data) {
    item.user_count = 1;
    item.user_price = item.price -(item.price / 100) * 24
    localStorage.setItem("data", JSON.stringify([item, ...oldData]));
  }
};

const total_price = () => {
  const data = JSON.parse(localStorage.getItem("data")) || [];
  return data.reduce((i, item) => {
    return i + ((item.price - (item.price / 100) * 24) * item.user_count);
  }, 0);

};

// <button class="decrement_btn" data-decrement = "${item.id}">-</button>

const renderKorzinka = async () => {
  const data = JSON.parse(localStorage.getItem("data")) || [];
  cart_list.innerHTML = data?.map((item) => `
    <li class = "cart_item">
    <div class = "cart_img_block">
      <button class = "cart_del" data-id = "${item.id}">x</button>
      <img class = "cart_img" src = "${item.image}" alt = "img"/>
      <h1 class = "cart_sub_title">${item.title}</h1>
    </div>
    <div class = "cart_cart_bt">
      <div class = "cart_price_block">
        <p class = "cart_price_dis">$${(item.user_price).toFixed(2)}</p>
        <div class = "cart_dic_inc_block">
          <button class="increment_btn" data-increment = "${item.id}" >+</button>
          <h1 class="cart_counter">${item.user_count}</h1>
            ${
               item.user_count > 1
                 ? `<button data-decrement="${item.id}" class="p-2 bg-gray-400">-</button>`
                 : `<button data-id="${item.id}" class="p-2 bg-gray-400">X</button>`
             }
             
        </div>
      </div>
      <p class = "cart_dis">$${(item.price - (item.price / 100) * 24).toFixed(2)}</p>
    </div>
    </li>
  `).join("")

  cart_total_item.textContent = `${data.length}`
  cart_total_price.textContent = `TOTAL: $${total_price().toFixed(2)}`;
  cart_items_total.textContent = `TOTAL PRODUCTS: ${data.length}`;
};

renderKorzinka()

const renderItem = async (item) => {
  const data = await getItem(item);
  seller.innerHTML = data.map((item) => `
        <li class = "seller_sub_item">
        <div class = "seller_top">
            <img class = "seller_img" src = "${item.image}" alt = "img"/>
            <div class = "seller_btn_block">
                <div class = "seller_btns">
                    <button  class = "seller_btn_like"></button>
                    <button class = "seller_btn_kor" data-id = '${item.id}'></button>
                </div>
            </div>
        </div>
            <div class = "seller_content">
                <h2 class = "seller_sub_title">${item.title}</h2>
                <p class = "seller_rating">rating: ${item.rating.rate}</p>
                <div class = "seller_price_block">
                    <p class = "seller_price_old">$${(item.price - (item.price / 100) * 24).toFixed(2)}</p>
                    <del class = "seller_dis_price">$${item.price}</del>
                    <p class = "seller_dis_off">24% Off</p>
                </div>
            </div>
        </li>
    `).join("");
};

const renderData = async () => {
  const data = await getData();
  seller_list.innerHTML = data.map((item) => `
    <li class = "seller_item">
      <button class ="seller_btn" data-item ="${item}">${item}</button>
    </li>
  `).join("");

  btn[0].style.color = "#33a0ff";
  btn[0].style.borderBottom = "3px solid #33a0ff";
  renderItem(data[0]);
};
renderData();



seller_list.addEventListener("click", async (e) => {
  const item = e.target.dataset.item;

  if (item) {
    renderItem(item);
    for (let i of btn) {
      i.style.color = "";
      i.style.borderBottom = "";
    }
    e.target.style.color = "#33a0ff";
    e.target.style.borderBottom = "3px solid #33a0ff";
  }
});

seller.addEventListener("click", async (e) => {
  const item = e.target.closest('button')?.dataset.id;
  if (item) {
    const data = await getLocal(item);
    saveInfo(data);
    renderKorzinka()
  }
});

cart_list.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  delettedItem(id)
  renderKorzinka()
})

const delettedItem = (id) => {
  const data = JSON.parse(localStorage.getItem("data")) || [];
  const newData = data.filter((item) => item.id != id);
  localStorage.setItem("data", JSON.stringify(newData));

  renderKorzinka();
};


header_korzinka_btn.addEventListener("click", () => {
  cart_block.style.display = "block";
})

close.addEventListener("click", () => {
  cart_block.style.display = "none";
})

cart_list.addEventListener("click", (e) => {
  const inc = e.target.dataset.increment;
  const dec = e.target.dataset.decrement;
  const products = JSON.parse(localStorage.getItem("data")) || [];

  if (inc || dec) {
    const newData = products.map((item) => {
      if (inc == item.id) {
        return {
          ...item,
          user_count: item.user_count + 1,
          user_price: (item.price-(item.price / 100) * 24) * (item.user_count + 1),
        };
      }
      if (dec == item.id && item.user_count > 0) {
        return {
          ...item,
          user_count: item.user_count - 1,
          user_price: (item.price-(item.price / 100) * 24) * (item.user_count - 1),
        };
      }
      return item;
    });

    localStorage.setItem("data", JSON.stringify(newData));
    renderKorzinka();
  }
});
