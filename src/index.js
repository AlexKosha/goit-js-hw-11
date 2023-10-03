import axios from "axios"
import { Notify } from "notiflix";

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs ={
    form : document.querySelector(".search-form"),
    gallery : document.querySelector('.gallery'),
    loadMore : document.querySelector('.hidden')
}

let page = 1
let searchQuery = ''

const galleryModal = new SimpleLightbox('.photo-card .gallery__link', {
    captionsData: 'alt',
    captionDelay: 250,
  });

refs.form.addEventListener('submit', onSearch)
refs.loadMore.addEventListener('click', onLoadMore)

async function fetchPhotos(query, page = 1,){
    const BASE_URL = 'https://pixabay.com/api/'
    const API_KEY = '39799676-ffca3689f9c6f15d7ef094ccc'

    const options = new URLSearchParams({
        key : API_KEY,
        q : query,
        per_page: 40,
        page,
        image_type :"photo",
        orientation :"horizontal",
        safesearch: "true"
    });

    try{
        const res = await axios.get(`${BASE_URL}?${options}`)
        const data = await res.data;
        if(data.hits.lenght === 0){
            return;
        }
        return data;
    }catch(error){
        return [];
    }
}

function onSearch(e){
    e.preventDefault();

    page = 1
    
    refs.gallery.innerHTML= ''
    refs.loadMore.classList.replace('load-more', 'hidden')

    searchQuery = e.currentTarget.elements.searchQuery.value
    
    fetchPhotos(searchQuery)
    .then((data) => {
        refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits))

        Notify.info(`Hooray! We found ${data.totalHits} images.`)

            if (page < data.totalHits) {
                refs.loadMore.classList.replace('hidden', 'load-more')
            }
    }).catch(err => Notify.failure("Sorry, there are no images matching your search query. Please try again."))
}

function onLoadMore({target}) {
    page += 1;
    target.disabled = true;
    
    fetchPhotos(searchQuery, page)
    .then(data => {

        refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));

        if (page >= data.totalHits) {
            Notify.info("We're sorry, but you've reached the end of search results.")
         refs.loadMore.classList.replace('load-more', 'hidden')   
        }
}).catch(err => console.log(err))
.finally(()=>(target.disabled = false)) ;
}

function createMarkup (arr){
    if(arr.length === 0){
       Notify.failure("Sorry, there are no images matching your search query. Please try again.")
       return '';
    }
return arr.map(({tags, webformatURL, largeImageURL, views, likes, comments, downloads}) =>  `<div class="photo-card">
    <a class="gallery__link" href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width='360' height='300'/>
    </a>
  <div class="info">
    <p class="info-item">
    likes
        <b>${likes}</b>
    </p>
    <p class="info-item">
    views
        <b>${views}</b>
    </p>
    <p class="info-item">
    comments
        <b>${comments}</b>
    </p>
    <p class="info-item">
    downloads
        <b>${downloads}</b>
    </p>
  </div>
</div>`)
.join('')
}