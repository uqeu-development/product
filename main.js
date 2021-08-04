let region = 'GB';
let comingSoonMsg = 'Coming soon...';
let skus = ''
let urlPrefix = "https://www.uniqlo.com";
if (window.location.href.includes("prodtest")) urlPrefix = 'https://prodtest.uniqlo.com'
let totalFetchedProducts = [];
let totalProducts = [];

if (window.location.href.includes('uk/en')) {
    region = 'GB';
    comingSoonMsg = 'Coming soon...';
} else if (window.location.href.includes('se/en')) {
    region = 'SE';
    comingSoonMsg = 'Coming soon...';
} else if (window.location.href.includes('dk/en')) {
    region = 'DK';
    comingSoonMsg = 'Coming soon...';
} else if (window.location.href.includes('eu/en')) {
    region = 'EU';
    comingSoonMsg = 'Coming soon...';
} else if (window.location.href.includes('es/es')) {
    region = 'ES';
    comingSoonMsg = 'Próximamente...';
} else if (window.location.href.includes('fr/fr')) {
    region = 'FR';
    comingSoonMsg = 'Bientôt disponible...';
} else if (window.location.href.includes('de/de')) {
    region = 'DE';
    comingSoonMsg = 'Demnächst...';
} else if (window.location.href.includes('it/it')) {
    region = 'IT';
    comingSoonMsg = 'Prossimamente...'
}

const productElements = document.querySelectorAll('[data-sku]')


Array.from(productElements).map((prod, index) => {
    !totalProducts.includes(prod.dataset.sku) ? totalProducts.push(prod.dataset.sku) : null; // push to the array if it doesn't exist
    skus += `&item${index}=${prod.dataset.sku}`; //output: &item0=12345&item1=67891&item2=25468
})

let link = `${urlPrefix}/on/demandware.store/Sites-${region}-Site/default/Recommendations-Ajax?&${skus}`;

const fetchProducts = () => fetch(link)
    .then(async data => {
        if (!data.ok) throw error;
        const text = await data.text();


        let parser = new DOMParser();
        let response = parser.parseFromString(text, 'text/html');


        if (!response.body.hasChildNodes) return //wasn't able to find anything

        Array.from(response.body.children).forEach((product) => {

            const sku = product.querySelector('[data-dlmasterid]').dataset?.dlmasterid;
            totalFetchedProducts.push(sku);
            const name = product.querySelector('.productTile__link')?.title;
            const price = product.querySelector('.product-standard-price')?.innerText || product.querySelector('.product-current-price')?.innerText;
            const salePrice = product.querySelector('.product-sales-price')?.innerText || '';
            const swatches = product.querySelector('.productTile__swatchList')?.innerHTML;
            const asset = product.querySelector('.productTile__image')?.src;
            const url = product.querySelector('.productTile__link')?.href;

            Array.from(document.body.querySelectorAll(`[data-sku="${sku}"]`)).forEach(prod => {
                prod.querySelector('[data-product-name]') ? prod.querySelector('[data-product-name]').innerText = name : "";
                prod.querySelector('[data-product-price]') ? prod.querySelector('[data-product-price]').innerText = price : "";
                prod.querySelector('[data-product-salePrice]') ? prod.querySelector('[data-product-salePrice]').innerText = salePrice : "";
                if (prod.querySelector('[data-product-price]')) {
                    if (salePrice.length > 0) prod.querySelector('[data-product-price]').classList.add('line-through');
                }
                prod.querySelector('[data-product-swatches]') ? prod.querySelector('[data-product-swatches]').innerHTML = swatches : ""
                prod.querySelector('[data-product-image]') ? prod.querySelector('[data-product-image]').src = asset : "";
                prod.querySelector('[data-product-url]') ? prod.querySelector('[data-product-url]').href = url : "";
            })

        })

        if (typeof onTheFunctionDone === 'function') {
            onTheFunctionDone(data.ok)
        }

    })
    .catch((error) => { console.log(error) })

//clean up will remove all empty blocks
const cleanUp = () => {
    const skusToDelete = totalProducts.filter(x => !totalFetchedProducts.includes(x));
    skusToDelete.forEach(sku => {
        Array.from(document.querySelectorAll(`[data-sku="${sku}"]`)).forEach((el) => {
            el.style.display = "none"
        })
    })

}

const dev = () => {
    const difference = totalProducts.filter(x => !totalFetchedProducts.includes(x));
    console.log({ totalProducts, totalFetchedProducts, totalFailed: difference })
}

//Add coming soon to non live products
const addComingSoonMsg = () => {
    const skusToAddMsg = totalProducts.filter(x => !totalFetchedProducts.includes(x));
    skusToAddMsg.forEach(sku => {
        Array.from(document.querySelectorAll(`[data-sku="${sku}"]`)).forEach((el) => {
            el.querySelector('[data-product-name]') ? el.querySelector('[data-product-name]').innerText = comingSoonMsg : console.error('data-product-name not found.')
            el.querySelector('[data-product-name]') ? el.querySelector('[data-product-name]').classList.add('coming-soon-msg') : ""
            el.querySelector('[data-product-url]') ? el.querySelector('[data-product-url]').style.pointerEvents = "none" : ""
        })
    })
}




fetchProducts() //init fetch



