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
    comingSoonMsg = 'Muy pronto';
} else if (window.location.href.includes('fr/fr')) {
    region = 'FR';
    comingSoonMsg = 'Bientôt disponible...';
} else if (window.location.href.includes('de/de')) {
    region = 'DE';
    comingSoonMsg = 'Demnächst';
} else if (window.location.href.includes('it/it')) {
    region = 'IT';
    comingSoonMsg = 'Prossimamente...'
}

const productElements = document.querySelectorAll('[data-sku]')


Array.from(productElements).map((prod, index) => {
    !totalProducts.includes(prod.dataset.sku) ? totalProducts.push(prod.dataset.sku) : null; // push to the array if it doesn't exist
    skus += `&item${index}=${prod.dataset.sku}`; //output: &item0=12345&item1=67891&item2=25468
})

let link = `${urlPrefix}/on/demandware.store/Sites-${region}-Site/default/Recommendations-Ajax?&${skus}&showrating=true`;

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
            const saleBadge = product.querySelector('.soldes')?.innerText.replace(/(\r\n|\n|\r)/gm," ");
            
            
            
            const extendedsizeBadge = product.querySelector('.extendedSize')?.innerText;
            
            let swatches = product.querySelector('.productTile__swatchList')?.innerHTML;

            const asset = product.querySelector('.productTile__image')?.src;
            const url = product.querySelector('.productTile__link')?.href;

            const rating = product.querySelector('.productTile__bazaarVoice')?.dataset.bvaveragerating;
            const ratingCount = product.querySelector('.productTile__bazaarVoice')?.dataset.bvreviewcount;

            Array.from(document.body.querySelectorAll(`[data-sku="${sku}"]`)).forEach(prod => {
                
                prod.querySelector('[data-product-name]') ? 
                prod.querySelectorAll('[data-product-name]').forEach(nameAttribute=>{
                    nameAttribute.innerText = name
                }): "";
               
                prod.querySelector('[data-product-price]') ? 
                prod.querySelectorAll('[data-product-price]').forEach(priceAttribute =>{
                    priceAttribute.innerText = price;
                }): "";

                prod.querySelector('[data-product-salePrice]') ? 
                prod.querySelectorAll('[data-product-salePrice]').forEach(salePriceAttribute=>{
                    salePriceAttribute.innerText = salePrice;
                }): "";
            
                if (prod.querySelector('[data-product-price]')) {
                    if (salePrice.length > 0) {
                        prod.querySelectorAll('[data-product-price]').forEach(priceAttribute=>{
                            priceAttribute.classList.add('line-through');
                        })
                    }
                }

                prod.querySelector('[data-product-salebadge]') ? 
                prod.querySelectorAll('[data-product-salebadge]').forEach(saleBadgeAttribute=>{
                    saleBadgeAttribute.innerText = saleBadge;
                }): ""
            

                if (typeof(saleBadge) != "undefined")  {
                  $(".label").hide();
                }
            
                        
                prod.querySelector('[data-product-swatches]') ?
                prod.querySelectorAll('[data-product-swatches]').forEach(swatchesAttributes=>{
                    swatchesAttributes.innerHTML = swatches;
                }) : "";


                prod.querySelector('[data-product-image]') ? 
                prod.querySelectorAll('[data-product-image]').forEach(imageAttribute=>{
                    imageAttribute.src = asset;
                }): ""

                prod.querySelector('[data-product-url]') ?
                prod.querySelectorAll('[data-product-url]').forEach(urlAttribute=>{
                    urlAttribute.href = url;
                }) : "";

                prod.querySelector('[data-product-rating]') ?
                prod.querySelectorAll('[data-product-rating]').forEach(ratingAttribute=>{
                    ratingAttribute.dataset.productRating = rating;
                }):"";

                prod.querySelector('[data-product-stars]') ?
                prod.querySelectorAll('[data-product-stars]').forEach(starAttribute=>{
                    starAttribute.style.width = `${rating/5 * 100}%`;
                }): "";

                prod.querySelector('[data-product-ratingCount]') ?
                prod.querySelectorAll('[data-product-ratingCount]').forEach(ratingCountAttribute=>{
                    ratingCountAttribute.innerHTML = `(${ratingCount})`;
                }): "";

                prod.querySelector('[data-product-ratingNum]') ?
                prod.querySelectorAll('[data-product-ratingNum]').forEach(ratingNumAttribute=>{
                    ratingNumAttribute.innerHTML = `${Math.round(rating * 10) / 10}`;
                }):"";
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
            
            el.querySelector('[data-product-name]') ? 
            el.querySelectorAll('[data-product-name]').forEach(productName =>{
                productName.innerText = comingSoonMsg;
                productName.classList.add('coming-soon-msg');
            }): console.log('data-product-name not found');

            el.querySelector('[data-product-url]')?
            el.querySelectorAll('[data-product-url]').forEach(urlAttribute=>{
                urlAttribute.style.pointerEvents = "none";
            }): "";
        })
    })
}



// HELLO WORLD

fetchProducts() //init fetch