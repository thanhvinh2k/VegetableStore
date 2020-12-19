var price = document.querySelectorAll('#product-price li');

function removeActive(option) {
    if (option == 'price') {
        for (var i = 0; i < price.length; i++) {
            price[i].classList.remove('active');
        }
    }
}
for (var i = 0; i < price.length; i++) {
    price[i].onclick = function() {
        removeActive('price');
        this.classList.add('active');
    };
}
